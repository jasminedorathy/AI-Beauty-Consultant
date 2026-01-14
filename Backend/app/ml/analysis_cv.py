import cv2
import numpy as np
import math

def calculate_face_shape(landmarks, width, height):
    """
    Determines face shape based on geometric ratios of landmarks.
    """
    # Helper to get coordinates
    def get_coords(idx):
        return (landmarks[idx].x * width, landmarks[idx].y * height)

    def dist(p1, p2):
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    # Key Landmarks (MediaPipe Face Mesh indices)
    # Jawline: 172 (left), 397 (right), 152 (chin)
    # Cheekbones: 234 (left), 454 (right)
    # Forehead: 103 (left), 332 (right) ~ approximate width
    # Face Height: 10 (top), 152 (bottom)

    jaw_left = get_coords(172)
    jaw_right = get_coords(397)
    chin = get_coords(152)
    
    cheek_left = get_coords(234)
    cheek_right = get_coords(454)
    
    forehead_left = get_coords(103)
    forehead_right = get_coords(332)
    
    face_top = get_coords(10)
    face_bottom = get_coords(152)

    # Calculate Widths & Height
    jaw_width = dist(jaw_left, jaw_right)
    cheek_width = dist(cheek_left, cheek_right)
    forehead_width = dist(forehead_left, forehead_right)
    face_height = dist(face_top, face_bottom)

    # Ratios
    # 1. Face Length to Width Ratio (using cheek width as reference)
    if cheek_width == 0: cheek_width = 1
    length_ratio = face_height / cheek_width
    
    # 2. Key Width Ratios
    jaw_cheek_ratio = jaw_width / cheek_width
    forehead_cheek_ratio = forehead_width / cheek_width
    
    shape = "Oval" # Default

    # --- FACE SHAPE LOGIC TREE (Based on diagram) ---
    
    # 1. LONG (Oblong)
    # Face gracefully tapers, Elongated feature (High length ratio)
    if length_ratio > 1.45:
        shape = "Long"
        # Sub-check: If jaw is very strong, could be "Rectangle" but user requested Long/Square split.
        if jaw_cheek_ratio > 0.9:
            shape = "Square" # Or "Rectangle" -> Mapped to Square usually
            
    # 2. ROUND vs SQUARE (Short/Wide faces, ratio < 1.25)
    elif length_ratio < 1.25:
        # Round: Widest at cheeks, soft jaw (Jaw << Cheek)
        # Square: Jaw wide (~Cheek), angular
        if jaw_cheek_ratio > 0.9:
            shape = "Square"
        else:
            shape = "Round"
            
    # 3. DIAMOND vs HEART vs OVAL (Medium ratio 1.25 - 1.45)
    else:
        # Diamond: Widest at cheeks (Forehead < Cheek AND Jaw < Cheek), Angular chin, Pointy
        if forehead_cheek_ratio < 0.9 and jaw_cheek_ratio < 0.8:
            shape = "Diamond"
            
        # Heart: Wide Forehead (Forehead > Cheek or Forehead ~= Cheek), Narrow Chin/Jaw
        elif forehead_cheek_ratio >= 0.9 and jaw_cheek_ratio < 0.75:
            shape = "Heart"
            
        # Oval: Balanced. Forehead slightly wider than jaw, but less than cheeks.
        # "An ideal face shape" according to diagram
        else:
            # Differentiating Oval from mild Heart/Diamond
            if jaw_cheek_ratio > 0.85:
                shape = "Square" # Soft Square
            else:
                shape = "Oval"

    # Debug
    print(f"📐 FACE SHAPE DEBUG: L/W={length_ratio:.2f}, J/C={jaw_cheek_ratio:.2f}, F/C={forehead_cheek_ratio:.2f} -> {shape}")

    return shape

def classify_gender_geometric(landmarks, width, height, image=None):
    """
    Estimates gender based on Geometric Features + Stubble/Beard Detection.
    Returns "Male" or "Female".
    """
    def get_coords(idx):
        return (landmarks[idx].x * width, landmarks[idx].y * height)

    def dist(p1, p2):
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

    # --- 1. GEOMETRIC FEATURES ---
    
    # 1a. Jaw Width Ratio
    jaw_width = dist(get_coords(172), get_coords(397))
    cheek_width = dist(get_coords(234), get_coords(454))
    if cheek_width == 0: cheek_width = 1
    jaw_ratio = jaw_width / cheek_width 

    # 1b. Chin Shape Ratio
    chin_width = dist(get_coords(148), get_coords(377))
    chin_ratio = chin_width / cheek_width 

    # 1c. Lip Thickness Ratio
    lip_height = dist(get_coords(13), get_coords(14)) + dist(get_coords(14), get_coords(17))
    face_height = dist(get_coords(10), get_coords(152))
    lip_ratio = lip_height / face_height if face_height > 0 else 0

    # 1d. Nose Width Ratio
    nose_width = dist(get_coords(102), get_coords(331))
    nose_ratio = nose_width / cheek_width
    
    # --- 2. TEXTURE / BEARD CHECK ---
    beard_score = 0
    if image is not None:
        try:
            h, w, _ = image.shape
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            def get_pt(idx):
                return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))

            # Chin ROI (Beard Zone)
            chin_indices = [152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454, 356, 389, 251, 284, 332, 297, 338, 10, 109, 67, 103, 54, 21, 162, 127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148] 
            # Simplified Chin Polygon
            chin_poly = [152, 377, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127]
            # Actually simpler: Jawline Bottom Loop
            jaw_loop = [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397]
            
            mask = np.zeros_like(gray)
            pts = np.array([get_pt(i) for i in jaw_loop], dtype=np.int32)
            cv2.fillPoly(mask, [pts], 255)
            
            # ROI Texture
            mean, std_dev = cv2.meanStdDev(gray, mask=mask)
            
            # Compare with Cheek (Smooth)
            # Cheek indices
            cheek_loop = [123, 50, 205, 117, 118, 101, 214, 212]
            mask_cheek = np.zeros_like(gray)
            pts_cheek = np.array([get_pt(i) for i in cheek_loop], dtype=np.int32)
            cv2.fillPoly(mask_cheek, [pts_cheek], 255)
            
            mean_c, std_c = cv2.meanStdDev(gray, mask=mask_cheek)
            
            # Texture Difference (Beard area usually rougher or darker stubble)
            # Or use Laplacian
            lap = cv2.Laplacian(gray, cv2.CV_64F)
            var_chin = np.var(lap[mask > 0])
            var_cheek = np.var(lap[mask_cheek > 0])
            
            # Ratio
            texture_ratio = var_chin / var_cheek if var_cheek > 0 else 1
            
            # --- MUSTACHE CHECK (To validate Beard) ---
            # Shadows usually fall on chin, but rarely on upper lip (mustache zone)
            # If both are rough -> Real Hair. If only chin is rough -> Shadow.
            mustache_indices = [164, 393, 321, 335, 292, 411, 264, 2, 326, 340, 416, 435, 367, 364, 433, 371] # Approx upper lip
            mask_stache = np.zeros_like(gray)
            pts_stache = np.array([get_pt(i) for i in mustache_indices], dtype=np.int32)
            cv2.fillPoly(mask_stache, [pts_stache], 255)
            
            mean_m, std_m = cv2.meanStdDev(gray, mask=mask_stache)
            stache_var = np.var(cv2.Laplacian(gray, cv2.CV_64F)[mask_stache > 0])
            stache_ratio = stache_var / var_cheek if var_cheek > 0 else 1
            
            # Smart Beard Logic: Requires BOTH Chin and Mustache roughness (or extreme chin roughness)
            if (texture_ratio > 1.3 and stache_ratio > 1.2) or texture_ratio > 3.5:
                 beard_score = 1
            
            print(f"🧬 BEARD DEBUG: Chin={texture_ratio:.2f}, Stache={stache_ratio:.2f} -> Beard={beard_score}")

        except Exception as e:
            print(f"⚠️ Beard Check Failed: {e}")

    # --- 3. EYEBROW THICKNESS CHECK (Dimorphic Trait) ---
    # Men usually have thicker eyebrows relative to eye size
    eyebrow_h = dist(get_coords(65), get_coords(158)) + dist(get_coords(295), get_coords(385))
    eye_h = dist(get_coords(159), get_coords(145)) + dist(get_coords(386), get_coords(374))
    brow_ratio = eyebrow_h / eye_h if eye_h > 0 else 0
    
    # --- SCORING & VOTING (Balanced Model) ---
    score = 0
    
    # 1. Jaw Ratio (Structure)
    if jaw_ratio > 0.95: score += 1 # Standardized threshold
    
    # 2. Chin (Width)
    if chin_ratio > 0.40: score += 1     
    
    # 3. Lips (Thinness)
    if lip_ratio < 0.040: score += 1     
    
    # 4. Nose (Width)
    if nose_ratio > 0.32: score += 1 
    
    # 5. Eyebrows (Thickness) - NEW
    if brow_ratio > 0.8: score += 1
    
    # 6. Beard (Texture)
    # Strong indicator, adds 2 points
    if beard_score > 0: score += 2

    # SCORE ANALYSIS
    # Max Score = 7 (5 traits + 2 for beard)
    # Threshold = 3 (Balanced)
    
    print(f"🧬 GENDER DEBUG: Jaw={jaw_ratio:.2f} Lip={lip_ratio:.3f} Brow={brow_ratio:.2f} Beard={beard_score} -> Score={score}")

    pred = "Male" if score >= 3 else "Female" 
    
    # Removed dangerous override for widespread jaws (women can have strong jaws)
    # if jaw_ratio > 0.95: pred = "Male"
    
    print(f"🧬 GENDER RESULT: Jaw={jaw_ratio:.2f}, Chin={chin_ratio:.2f}, Lip={lip_ratio:.3f}, Nose={nose_ratio:.2f}, Beard={beard_score} -> Score={score} -> {pred}")
    return pred

def analyze_skin_cv(image, landmarks):
    """
    Analyzes skin properties using ROI-specific Computer Vision.
    Returns calibrated scores 0.0 - 1.0.
    """
    h, w, _ = image.shape
    
    # Helper to get numpy points
    def get_pt(idx):
        return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))

    # Helper to create Mask from polygon indices
    def get_mask(indices):
        mask = np.zeros((h, w), dtype=np.uint8)
        points = np.array([get_pt(i) for i in indices], dtype=np.int32)
        cv2.fillPoly(mask, [points], 255)
        return mask

    # --- ROI DEFINITIONS (MediaPipe Indices) ---
    cheek_indices_left = [123, 50, 205, 117, 118, 101, 214, 212]
    cheek_indices_right = [352, 280, 425, 346, 347, 330, 434, 432]
    forehead_indices = [103, 104, 105, 9, 334, 333, 332, 297, 338, 10, 109, 67]
    nose_indices = [197, 195, 5, 4, 1, 2, 94, 168]

    # Create Masks
    mask_cheeks = cv2.bitwise_or(get_mask(cheek_indices_left), get_mask(cheek_indices_right))
    mask_tzone = cv2.bitwise_or(get_mask(forehead_indices), get_mask(nose_indices))

    # --- SIGMOID CALIBRATION ---
    def calibrate(raw_val, mid=0.15, k=15):
        return 1.0 / (1.0 + np.exp(-k * (raw_val - mid)))

    # --- 1. ACNE (Redness on Cheeks) ---
    lab_img = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab_img)
    
    mean_a = cv2.mean(a, mask=mask_cheeks)[0]
    
    _, red_thresh = cv2.threshold(a, 145, 255, cv2.THRESH_BINARY)
    red_result = cv2.bitwise_and(red_thresh, red_thresh, mask=mask_cheeks)
    acne_ratio = np.count_nonzero(red_result) / np.count_nonzero(mask_cheeks) if np.count_nonzero(mask_cheeks) > 0 else 0
    acne_calibrated = calibrate(acne_ratio, mid=0.05, k=30)
    
    # --- 2. OILINESS (Shine on T-Zone) ---
    hsv_img = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    v_chan = hsv_img[:,:,2]
    
    _, shine_thresh = cv2.threshold(v_chan, 220, 255, cv2.THRESH_BINARY)
    shine_result = cv2.bitwise_and(shine_thresh, shine_thresh, mask=mask_tzone)
    oil_ratio = np.count_nonzero(shine_result) / np.count_nonzero(mask_tzone) if np.count_nonzero(mask_tzone) > 0 else 0
    oil_calibrated = calibrate(oil_ratio, mid=0.08, k=25)

    # --- 3. TEXTURE (Roughness on Cheeks) ---
    # --- 3. TEXTURE (Advanced Entropy Analysis for Clinical Accuracy) ---
    gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Method A: Laplacian (Edge Detection)
    edges = cv2.Laplacian(gray_img, cv2.CV_64F)
    cheek_edges = edges[mask_cheeks > 0]
    variance = np.var(cheek_edges) if cheek_edges.size > 0 else 0
    
    # Method B: Shannon Entropy (Statistical Texture)
    # Higher entropy = more chaos (roughness/pores)
    # Lower entropy = uniform (smooth skin)
    def calc_entropy(roi_vals):
        if roi_vals.size == 0: return 0
        hist, _ = np.histogram(roi_vals, bins=256, range=(0, 256), density=True)
        hist = hist[hist > 0]
        return -np.sum(hist * np.log2(hist))

    cheek_pixels = gray_img[mask_cheeks > 0]
    entropy = calc_entropy(cheek_pixels)
    
    # Hybrid Score: Combine Variance (Edges) + Entropy (chaos)
    # Variance typical range: 100-1000. Entropy typical range: 5-8.
    
    # Calibrate Entropy: > 7.5 is rough, < 6.0 is smooth
    entropy_score = calibrate(entropy, mid=7.0, k=2)
    var_score = calibrate(variance, mid=400, k=0.01)
    
    # Weighted Average (Entropy is more robust to lighting than Variance)
    texture_calibrated = (0.6 * entropy_score) + (0.4 * var_score)

    return {
        "acne": float(round(acne_calibrated, 2)),
        "oiliness": float(round(oil_calibrated, 2)),
        "texture": float(round(texture_calibrated, 2))
    }

def generate_annotated_image(image, landmarks, gender=None):
    """
    Draws visual diagnostics.
    Visual style adapts to gender if provided (e.g., Blue for Male, Purple for Female).
    """
    annotated = image.copy()
    h, w, _ = annotated.shape
    
    # Theme Colors
    if gender == "Male":
        main_color = (255, 100, 0) # Blue (BGR)
        zone_color = (200, 50, 0)
    else:
        main_color = (255, 0, 255) # Pink/Purple
        zone_color = (0, 255, 255) # Cyan

    def get_pt(idx):
        return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))

    # 1. DRAW KEY FACE SHAPE POINTS
    jaw = [get_pt(172), get_pt(152), get_pt(397)]
    jaw_np = np.array(jaw, dtype=np.int32).reshape((-1, 1, 2))
    cv2.polylines(annotated, [jaw_np], isClosed=False, color=main_color, thickness=2)

    cv2.line(annotated, get_pt(234), get_pt(454), (0, 255, 0), 2)
    cv2.line(annotated, get_pt(103), get_pt(332), main_color, 2)

    # 2. DRAW ZONES
    tzone_indices = [103, 104, 105, 9, 334, 333, 332, 297, 338, 10, 109, 67]
    tzone_pts = np.array([get_pt(i) for i in tzone_indices], dtype=np.int32).reshape((-1, 1, 2))
    cv2.polylines(annotated, [tzone_pts], True, zone_color, 1, cv2.LINE_AA) 

    cheek_left = [123, 50, 205, 117, 118, 101, 214, 212]
    cheek_right = [352, 280, 425, 346, 347, 330, 434, 432]
    
    chk_l_pts = np.array([get_pt(i) for i in cheek_left], dtype=np.int32).reshape((-1, 1, 2))
    chk_r_pts = np.array([get_pt(i) for i in cheek_right], dtype=np.int32).reshape((-1, 1, 2))
    
    cv2.polylines(annotated, [chk_l_pts], True, (0, 0, 255), 1, cv2.LINE_AA) 
    cv2.polylines(annotated, [chk_r_pts], True, (0, 0, 255), 1, cv2.LINE_AA)

    # 3. DRAW LANDMARK DOTS
    for i, lm in enumerate(landmarks):
        if i % 10 == 0: 
             cx, cy = int(lm.x * w), int(lm.y * h)
             cv2.circle(annotated, (cx, cy), 1, (200, 200, 200), -1, cv2.LINE_AA)

    return annotated
