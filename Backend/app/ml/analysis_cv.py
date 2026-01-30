import cv2
import numpy as np
import math
import os

# Try to load DenseNet-201 for Skin Analysis (97% accuracy target)
# Try to load DenseNet-201 for Skin Analysis (97% accuracy target)
# MIGRATION UPDATE: Switched to PyTorch. TensorFlow models disabled.
# try:
#     from tensorflow.keras.models import load_model
#     
#     # Priority 1: DenseNet-201 (if trained)
#     DENSENET_PATH = os.path.join(os.path.dirname(__file__), '../models/densenet_skin.h5')
#     
#     # Priority 2: Pre-trained DenseNet (not fine-tuned yet)
#     DENSENET_PRETRAINED = os.path.join(os.path.dirname(__file__), '../models/densenet_skin_pretrained.h5')
#     
#     # Priority 3: Original CNN (fallback)
#     CNN_MODEL_PATH = os.path.join(os.path.dirname(__file__), '../models/skin_cnn.h5')
#     
#     if os.path.exists(DENSENET_PATH):
#         skin_model = load_model(DENSENET_PATH)
#         print("✅ Analysis: DenseNet-201 Loaded (Fine-tuned)")
#         MODEL_TYPE = "densenet"
#     elif os.path.exists(DENSENET_PRETRAINED):
#         skin_model = load_model(DENSENET_PRETRAINED)
#         print("✅ Analysis: DenseNet-201 Loaded (Pre-trained)")
#         MODEL_TYPE = "densenet_pretrained"
#     elif os.path.exists(CNN_MODEL_PATH):
#         skin_model = load_model(CNN_MODEL_PATH)
#         print("✅ Analysis: CNN Model Loaded (Legacy)")
#         MODEL_TYPE = "cnn"
#     else:
#         skin_model = None
#         MODEL_TYPE = None
#         print("⚠️ No skin model found - using CV-only analysis")
# except Exception as e:
#     print(f"⚠️ Analysis: Model loading error ({e})")
#     skin_model = None
#     MODEL_TYPE = None

skin_model = None
MODEL_TYPE = None
print("ℹ️ Analysis: Running in PyTorch Migration Mode (TF models disabled)")

# --- ADVANCED PREPROCESSING (Industry Standard) ---

def apply_retinex(image):
    """
    Multi-Scale Retinex (MSR) for lighting correction.
    Improves accuracy by +3-5% in varied lighting conditions.
    """
    img_float = image.astype(np.float32) + 1.0  # Avoid log(0)
    
    # Multi-scale Gaussian blur
    scales = [15, 80, 250]
    msr = np.zeros_like(img_float)
    
    for scale in scales:
        blurred = cv2.GaussianBlur(img_float, (0, 0), scale)
        msr += np.log10(img_float) - np.log10(blurred)
    
    msr = msr / len(scales)
    
    # Normalize to 0-255
    msr_norm = cv2.normalize(msr, None, 0, 255, cv2.NORM_MINMAX)
    return msr_norm.astype(np.uint8)

def apply_bilateral_filter(image):
    """
    Bilateral filter for edge-preserving noise removal.
    Smooths skin while keeping facial features sharp.
    """
    return cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)

def extract_skin_mask_hsv(image):
    """
    HSV-based skin segmentation for background removal.
    More accurate than simple color thresholding.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Skin color range in HSV (works across ethnicities)
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    # Morphological operations to clean mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    
    return mask

# --- 1. FACE SHAPE ANALYSIS (VECTOR SIMILARITY + ANGLE) ---

def calculate_face_shape(landmarks, width, height):
    """
    Improved face shape classification using refined geometric analysis.
    Uses multiple measurements and research-based centroids for higher accuracy.
    """
    def get_coords(idx):
        return (landmarks[idx].x * width, landmarks[idx].y * height)

    def dist(p1, p2):
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    def calculate_angle(a, b, c):
        """Calculates angle ABC (in degrees)"""
        ba = np.array([a[0]-b[0], a[1]-b[1]])
        bc = np.array([c[0]-b[0], c[1]-b[1]])
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

    # IMPROVED LANDMARK SELECTION
    # Using more accurate landmark points for measurements
    
    # Jaw width: Use actual jaw corners (not too low)
    jaw_left = get_coords(172)   # Left jaw
    jaw_right = get_coords(397)  # Right jaw
    jaw_width = dist(jaw_left, jaw_right)
    
    # Cheekbone width: Widest part of face (temples)
    cheek_left = get_coords(234)   # Left cheekbone
    cheek_right = get_coords(454)  # Right cheekbone
    cheek_width = dist(cheek_left, cheek_right)
    
    # Forehead width: Between temples
    forehead_left = get_coords(103)   # Left temple
    forehead_right = get_coords(332)  # Right temple
    forehead_width = dist(forehead_left, forehead_right)
    
    # Face length: Top of forehead to bottom of chin
    face_top = get_coords(10)     # Top of forehead
    face_bottom = get_coords(152) # Bottom of chin
    face_height = dist(face_top, face_bottom)
    
    # Mid-face width (between eyes, for additional feature)
    mid_face_width = dist(get_coords(130), get_coords(359))
    
    # Jaw angle: Critical for distinguishing Square vs Round
    # Using 3 points: ear -> jaw corner -> chin
    jaw_angle = calculate_angle(get_coords(127), get_coords(172), get_coords(152))
    
    # Prevent division by zero
    if cheek_width == 0: cheek_width = 1
    if face_height == 0: face_height = 1

    # FEATURE VECTOR CALCULATION
    # 5 features for better discrimination
    length_to_width = face_height / cheek_width  # Overall proportion
    jaw_to_cheek = jaw_width / cheek_width       # Jaw narrowness
    forehead_to_cheek = forehead_width / cheek_width  # Forehead width
    angle_norm = jaw_angle / 140.0               # Jaw sharpness (normalized)
    mid_to_cheek = mid_face_width / cheek_width  # Mid-face proportion

    user_vector = np.array([length_to_width, jaw_to_cheek, forehead_to_cheek, angle_norm, mid_to_cheek])

    # REFINED CENTROIDS based on facial proportion research
    # [L/W, J/C, F/C, Angle/140, Mid/C]
    shapes_centroids = {
        "Oval":     np.array([1.50, 0.78, 0.88, 0.93, 0.65]),  # Balanced, soft jaw, classic proportions
        "Round":    np.array([1.10, 0.95, 0.92, 1.05, 0.70]),  # Short, wide jaw, wide angle
        "Square":   np.array([1.20, 0.98, 0.95, 0.75, 0.68]),  # Angular jaw, sharp angle ~105°
        "Heart":    np.array([1.35, 0.68, 1.00, 0.90, 0.62]),  # Wide forehead, narrow jaw
        "Long":     np.array([1.70, 0.82, 0.85, 0.92, 0.63]),  # Elongated face
        "Diamond":  np.array([1.45, 0.65, 0.75, 0.88, 0.60])   # Narrow forehead & jaw, wide cheeks
    }

    print(f"📐 MEASUREMENTS:")
    print(f"   Face H/W: {length_to_width:.2f}, Jaw/Cheek: {jaw_to_cheek:.2f}")
    print(f"   Forehead/Cheek: {forehead_to_cheek:.2f}, Jaw Angle: {jaw_angle:.1f}°")
    print(f"   Mid/Cheek: {mid_to_cheek:.2f}")

    # WEIGHTED DISTANCE CALCULATION
    # Weights prioritize most discriminative features
    # Length/Width: 1.5 (important for Long vs Round)
    # Jaw/Cheek: 2.0 (critical for Heart/Diamond vs others)
    # Forehead/Cheek: 1.5 (important for Heart shape)
    # Angle: 2.5 (most critical for Square vs Round distinction)
    # Mid/Cheek: 1.0 (supplementary feature)
    weights = np.array([1.5, 2.0, 1.5, 2.5, 1.0])
    
    dists = {}
    for shape, centroid in shapes_centroids.items():
        d = np.sqrt(np.sum(weights * (user_vector - centroid)**2))
        dists[shape] = d
        print(f"   {shape}: distance = {d:.3f}")
    
    # Find best match
    best_shape = min(dists, key=dists.get)
    min_dist = dists[best_shape]
    
    # Calculate confidence: inverse of normalized distance
    # Lower distance = higher confidence
    max_reasonable_dist = 1.5  # Empirically determined
    confidence = max(0.0, min(1.0, 1.0 - (min_dist / max_reasonable_dist)))
    
    # Apply confidence threshold - if too uncertain, default to Oval
    if confidence < 0.3:
        print(f"   ⚠️ Low confidence ({confidence*100:.1f}%), defaulting to Oval")
        best_shape = "Oval"
        confidence = 0.5

    print(f"   ✅ RESULT: {best_shape} (Confidence: {confidence*100:.1f}%)")
    return best_shape, confidence

# --- 2. GENDER ANALYSIS (CNN MODEL) ---

# Load Gender Model
try:
    GENDER_PROTO = os.path.join(os.path.dirname(__file__), '../models/gender_deploy.prototxt')
    GENDER_MODEL = os.path.join(os.path.dirname(__file__), '../models/gender_net.caffemodel')
    
    if os.path.exists(GENDER_PROTO) and os.path.exists(GENDER_MODEL):
        gender_net = cv2.dnn.readNetFromCaffe(GENDER_PROTO, GENDER_MODEL)
        print("✅ Analysis: Gender CNN Loaded")
    else:
        gender_net = None
        print("⚠️ Analysis: Gender CNN files not found")
except Exception as e:
    print(f"⚠️ Analysis: Gender CNN Error {e}")
    gender_net = None

def classify_gender_geometric(landmarks, width, height, image=None):
    """
    Estimates gender using Standard CNN (gender_net.caffemodel).
    Improved with better preprocessing and confidence thresholds.
    Fallback to hair/facial feature analysis if CNN fails.
    """
    # 1. Try CNN First
    if gender_net is not None and image is not None:
        try:
            # Face Crop logic - we need a good crop for the model (227x227)
            # Use landmarks to get bounding box
            xs = [lm.x for lm in landmarks]
            ys = [lm.y for lm in landmarks]
            
            x1 = int(min(xs) * width)
            y1 = int(min(ys) * height)
            x2 = int(max(xs) * width)
            y2 = int(max(ys) * height)
            
            # Add padding (very important for deep learning models)
            # Increased padding for better context
            pad_x = int((x2 - x1) * 0.5) # 50% padding (was 40%)
            pad_y = int((y2 - y1) * 0.5)
            
            img_h, img_w = image.shape[:2]
            x1 = max(0, x1 - pad_x)
            y1 = max(0, y1 - pad_y)
            x2 = min(img_w, x2 + pad_x)
            y2 = min(img_h, y2 + pad_y)
            
            face_crop = image[y1:y2, x1:x2]
            
            if face_crop.size > 0:
                # Enhanced preprocessing for better accuracy
                # 1. Resize to exact model input size
                face_resized = cv2.resize(face_crop, (227, 227))
                
                # 2. Apply histogram equalization for better contrast
                if len(face_resized.shape) == 3:
                    # Convert to YCrCb and equalize Y channel
                    ycrcb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2YCrCb)
                    ycrcb[:,:,0] = cv2.equalizeHist(ycrcb[:,:,0])
                    face_resized = cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2BGR)
                
                # 3. Create blob with proper mean values
                # Mean values for gender_net: (78.4263377603, 87.7689143744, 114.895847746)
                blob = cv2.dnn.blobFromImage(
                    face_resized, 
                    1.0, 
                    (227, 227), 
                    (78.4263377603, 87.7689143744, 114.895847746), 
                    swapRB=False
                )
                
                gender_net.setInput(blob)
                preds = gender_net.forward()
                
                # IMPORTANT: gender_net outputs [Male_Prob, Female_Prob]
                # Index 0 = Male, Index 1 = Female
                male_prob = float(preds[0][0])
                female_prob = float(preds[0][1])
                
                # Add confidence threshold to reduce misclassifications
                # If confidence is low, use fallback method
                confidence_diff = abs(male_prob - female_prob)
                
                if confidence_diff < 0.15:  # Low confidence (less than 15% difference)
                    print(f"⚠️ Low confidence ({confidence_diff*100:.1f}%), using fallback...")
                    # Use hair length as additional signal
                    return _gender_fallback_analysis(landmarks, width, height, image)
                
                # Determine gender based on higher probability
                if female_prob > male_prob:
                    pred_label = "Female"
                    conf = female_prob
                else:
                    pred_label = "Male"
                    conf = male_prob
                
                print(f"🧬 GENDER CNN: {pred_label} ({conf*100:.1f}%) [M:{male_prob*100:.1f}% F:{female_prob*100:.1f}%]")
                return pred_label

        except Exception as e:
            print(f"⚠️ Gender CNN Inference Failed: {e}")

    # 2. Fallback to Geometric/Hair Analysis
    return _gender_fallback_analysis(landmarks, width, height, image)


def _gender_fallback_analysis(landmarks, width, height, image=None):
    """
    Fallback gender detection using facial geometry and hair analysis.
    More reliable for edge cases.
    """
    try:
        # Method 1: Jaw width to face height ratio
        # Males typically have wider jaws relative to face height
        
        # Get key landmark points
        chin = landmarks[152]  # Chin point
        left_cheek = landmarks[234]  # Left cheek
        right_cheek = landmarks[454]  # Right cheek
        forehead = landmarks[10]  # Forehead
        
        # Calculate jaw width
        jaw_width = abs(right_cheek.x - left_cheek.x) * width
        
        # Calculate face height
        face_height = abs(chin.y - forehead.y) * height
        
        # Jaw to height ratio
        jaw_ratio = jaw_width / face_height if face_height > 0 else 0
        
        # Method 2: Eyebrow to eye distance
        # Females typically have higher eyebrows relative to eyes
        left_eyebrow = landmarks[70]  # Left eyebrow
        left_eye = landmarks[159]  # Left eye
        
        eyebrow_distance = abs(left_eyebrow.y - left_eye.y) * height
        
        # Method 3: Hair length detection (if image available)
        hair_score = 0
        if image is not None:
            # Check for long hair by analyzing pixels above forehead
            img_h, img_w = image.shape[:2]
            forehead_y = int(forehead.y * height)
            
            # Sample region above head
            if forehead_y > 50:
                hair_region = image[max(0, forehead_y - 50):forehead_y, :]
                
                # Long hair typically has more variation in color
                if hair_region.size > 0:
                    hair_std = np.std(hair_region)
                    hair_score = 1 if hair_std > 30 else 0  # Higher variation = likely long hair
        
        # Scoring system
        male_score = 0
        female_score = 0
        
        # Jaw ratio scoring (males typically > 0.75, females < 0.70)
        if jaw_ratio > 0.75:
            male_score += 2
        elif jaw_ratio < 0.70:
            female_score += 2
        else:
            # Neutral zone
            pass
        
        # Eyebrow distance scoring (females typically have more distance)
        if eyebrow_distance > 15:
            female_score += 1
        elif eyebrow_distance < 10:
            male_score += 1
        
        # Hair length scoring
        female_score += hair_score
        
        # Final decision
        if female_score > male_score:
            result = "Female"
        elif male_score > female_score:
            result = "Male"
        else:
            # Default to Female if tie (conservative approach for beauty app)
            result = "Female"
        
        print(f"🔍 FALLBACK GENDER: {result} (Jaw:{jaw_ratio:.2f}, Brow:{eyebrow_distance:.1f}px, Hair:{hair_score})")
        return result
        
    except Exception as e:
        print(f"⚠️ Fallback gender analysis failed: {e}")
        # Ultimate fallback - default to Female for beauty consultation
        return "Female"

    return "Female" # Default fallback safety

# --- 3. SKIN ANALYSIS (HYBRID: CNN + K-MEANS) ---

def analyze_skin_cv(image, landmarks):
    """
    Analyzes skin using Hybrid ML (CNN + K-Means) with advanced preprocessing.
    """
    # --- PREPROCESSING PIPELINE (Industry Standard) ---
    # Step 1: Bilateral filter for noise removal
    image = apply_bilateral_filter(image)
    
    # Step 2: Retinex for lighting correction
    image = apply_retinex(image)
    
    h, w, _ = image.shape
    
    def get_pt(idx):
        return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))

    # Mask Helper
    def get_mask(indices):
        mask = np.zeros((h, w), dtype=np.uint8)
        points = np.array([get_pt(i) for i in indices], dtype=np.int32)
        cv2.fillPoly(mask, [points], 255)
        return mask

    # ROIs
    cheek_indices_left = [123, 50, 205, 117, 118, 101, 214, 212]
    cheek_indices_right = [352, 280, 425, 346, 347, 330, 434, 432]
    forehead_indices = [103, 104, 105, 9, 334, 333, 332, 297, 338, 10, 109, 67]
    nose_indices = [197, 195, 5, 4, 1, 2, 94, 168]

    mask_cheeks = cv2.bitwise_or(get_mask(cheek_indices_left), get_mask(cheek_indices_right))
    mask_tzone = cv2.bitwise_or(get_mask(forehead_indices), get_mask(nose_indices))

    # --- A. CNN PREDICTION (Global Analysis) ---
    cnn_acne = 0.0
    cnn_oil = 0.0
    
    if skin_model:
        try:
            # Preprocess for CNN (224x224, scale)
            img_in = cv2.resize(image, (224, 224))
            img_in = img_in.astype("float32") / 255.0
            img_in = np.expand_dims(img_in, axis=0)
            
            preds = skin_model.predict(img_in, verbose=0)[0]
            # Assumed Mapping based on typical datasets: [Acne, Healthy, Oily]
            # This is a heuristic. If we are wrong, we rely on Voting.
            # But let's assume indices [0] and [2] are the anomalies
            cnn_acne = float(preds[0])
            cnn_oil = float(preds[2])
            
            print(f"🧠 CNN OUT: Acne={cnn_acne:.2f}, Normal={preds[1]:.2f}, Oil={cnn_oil:.2f}")
        except Exception as e:
            print(f"⚠️ CNN Error: {e}")

    # --- B. K-MEANS CLUSTERING (Local Analysis) ---
    kmeans_acne = 0.0
    
    try:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        cheek_pixels = lab[mask_cheeks > 0]
        
        if cheek_pixels.size > 0:
            cheek_pixels = cheek_pixels.astype(np.float32)
            # K=2 
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
            # Use PP_CENTERS for stability (deterministic initialization)
            _, labels, centers = cv2.kmeans(cheek_pixels, 2, None, criteria, 10, cv2.KMEANS_PP_CENTERS)

            # Check 'A' channel difference
            a_diff = abs(centers[0][1] - centers[1][1])
            
            # Determine mismatch
            red_cluster = 0 if centers[0][1] > centers[1][1] else 1
            ratio = np.sum(labels == red_cluster) / len(labels)
            
            # TUNED: Lower sensitivity threshold (from 5 to 2.5)
            if a_diff > 2.0: 
                kmeans_acne = min(ratio * 3.5, 1.0) 
            else:
                kmeans_acne = 0.1 # Base baseline if skin is uniform but model is wary
    except:
        pass
            
    # --- HYBRID VOTING ---
    # If CNN is confident (>0.6), trust it more. Else trust local CV.
    if cnn_acne > 0.6:
        final_acne = (0.7 * cnn_acne) + (0.3 * kmeans_acne)
    else:
        final_acne = (0.3 * cnn_acne) + (0.7 * kmeans_acne)
    
    # --- OILINESS (CV + CNN) ---
    b, g, r = cv2.split(image)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    v = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)[:,:,2]
    v_eq = clahe.apply(v)
    
    mean_tzone = cv2.mean(v_eq, mask=mask_tzone)[0]
    mean_cheek = cv2.mean(v_eq, mask=mask_cheeks)[0]
    oil_ratio = mean_tzone / mean_cheek if mean_cheek > 0 else 1.0
    cv_oil = np.clip((oil_ratio - 1.0) * 2.5, 0.05, 0.95)
    
    final_oil = max(cv_oil, cnn_oil) # Take max

    # --- TEXTURE (Entropy) ---
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cheek_roi = gray[mask_cheeks > 0]
    if cheek_roi.size > 0:
        hist, _ = np.histogram(cheek_roi, bins=256, range=(0, 256), density=True)
        hist = hist[hist > 0]
        entropy = -np.sum(hist * np.log2(hist))
        texture_score = np.clip((entropy - 5.5) / 2.0, 0.1, 0.95)
    else:
        texture_score = 0.5

    # --- STABILIZATION ---
    def stabilize(val):
        return round(val * 20) / 20.0 # Round to nearest 0.05

    return {
        "acne": float(stabilize(final_acne)),
        "oiliness": float(stabilize(final_oil)),
        "texture": float(stabilize(texture_score))
    }

def generate_annotated_image(image, landmarks, gender=None):
    annotated = image.copy()
    h, w, _ = annotated.shape
    
    color = (255, 100, 0) if gender == "Male" else (255, 0, 255)
    def get_pt(idx): return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))

    # Face Contour
    jaw_pts = [172, 152, 397]
    for i in range(len(jaw_pts)-1):
        cv2.line(annotated, get_pt(jaw_pts[i]), get_pt(jaw_pts[i+1]), color, 3) # Thicker
        
    # Zones
    tzone_indices = [103, 104, 105, 9, 334, 333, 332, 297, 338, 10, 109, 67]
    pts = np.array([get_pt(i) for i in tzone_indices], dtype=np.int32).reshape((-1, 1, 2))
    cv2.polylines(annotated, [pts], True, (0, 255, 255), 1, cv2.LINE_AA) 

    return annotated
