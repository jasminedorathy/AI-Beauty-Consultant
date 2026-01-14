import cv2
import numpy as np
import math

def calculate_face_shape(landmarks, width, height):
    """
    Determines face shape based on geometric ratios of landmarks.
    Landmarks are MediaPipe NormalizedLandmark objects (x, y, z).
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
    length_ratio = face_height / cheek_width
    
    # 2. Width Comparisons
    # Is forehead wider than jaw?
    # Is cheek wider than forehead?
    
    shape = "Oval" # Default

    # Logic Tree
    if length_ratio > 1.5:
        shape = "Oblong"
    elif abs(cheek_width - face_height) < face_height * 0.1: # Width ~ Height
        if jaw_width < cheek_width * 0.9: # Jaw significantly smaller
             shape = "Round"
        else:
             shape = "Square"
    else:
        # Longer faces or standard ratios
        if jaw_width > cheek_width * 0.9: # Strong jaw
            shape = "Rectangular" if length_ratio > 1.4 else "Square"
        elif forehead_width > cheek_width * 1.05 and jaw_width < cheek_width * 0.8:
            shape = "Heart"
        elif cheek_width > forehead_width and cheek_width > jaw_width:
             shape = "Diamond" if jaw_width < forehead_width else "Oval"
        else:
             shape = "Oval"

    return shape

def analyze_skin_cv(image, landmarks):
    """
    Analyzes skin properties using Computer Vision.
    Returns scores 0.0 - 1.0 (Low to High severity/presence).
    """
    h, w, _ = image.shape
    
    # 1. Skin Segmentation (Simple: blurred, central ROI)
    # We focus on the cheek/nose area roughly by using a central crop
    # A better approach would be masking via landmarks, but simple ROI works for general estimation.
    center_y, center_x = h // 2, w // 2
    roi_h, roi_w = int(h * 0.4), int(w * 0.4)
    roi = image[center_y - roi_h//2 : center_y + roi_h//2, 
                center_x - roi_w//2 : center_x + roi_w//2]
    
    if roi.size == 0:
        return {"acne": 0.0, "oiliness": 0.0, "texture": 0.0}

    # Preprocessing
    roi_blur = cv2.GaussianBlur(roi, (5, 5), 0)
    roi_hsv = cv2.cvtColor(roi_blur, cv2.COLOR_BGR2HSV)
    roi_lab = cv2.cvtColor(roi_blur, cv2.COLOR_BGR2LAB)
    
    # --- ACNE DETECTION (Redness/Inflammation) ---
    # In LAB space, 'a' channel represents Green-Red. High 'a' = Red.
    l, a, b = cv2.split(roi_lab)
    # Adaptive threshold for redness relative to average skin tone
    avg_a = np.mean(a)
    std_a = np.std(a)
    red_threshold = avg_a + 1.5 * std_a # Redder than average
    
    red_mask = cv2.inRange(a, red_threshold, 255)
    acne_score = np.count_nonzero(red_mask) / red_mask.size
    # Normalize score (heuristic scaling 0-1)
    acne_metric = min(acne_score * 10, 1.0) 

    # --- OILINESS DETECTION (Shine/Highlights) ---
    # Brightest spots in V channel usually indicate shine/oil
    v_chan = roi_hsv[:,:,2]
    # Threshold for specular highlights
    _, shine_mask = cv2.threshold(v_chan, 230, 255, cv2.THRESH_BINARY)
    oil_score = np.count_nonzero(shine_mask) / shine_mask.size
    oil_metric = min(oil_score * 20, 1.0)

    # --- TEXTURE / DRYNESS (Edge Density) ---
    # Dry skin often looks rougher. Smooth skin has fewer edges.
    gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    edges = cv2.Laplacian(gray_roi, cv2.CV_64F)
    variance = np.var(edges)
    # Higher variance = more texture/roughness
    texture_metric = min(variance / 500, 1.0) 

    return {
        "acne": float(round(acne_metric, 2)),
        "oiliness": float(round(oil_metric, 2)),
        "texture": float(round(texture_metric, 2))
    }

def generate_annotated_image(image, landmarks):
    """
    Draws visual diagnostics on the image:
    1. Face Mesh (Key Landmarks)
    2. Geometry Hull (Jaw, Cheeks, Forehead)
    """
    annotated = image.copy()
    h, w, _ = annotated.shape
    
    # Helper to clean coords
    def get_pt(idx):
        return (int(landmarks[idx].x * w), int(landmarks[idx].y * h))

    # 1. DRAW KEY FACE SHAPE POINTS
    # Jawline Loop: 172 -> 152 -> 397 -> 172
    jaw = [get_pt(172), get_pt(152), get_pt(397)]
    jaw_np = np.array(jaw, dtype=np.int32).reshape((-1, 1, 2))
    cv2.polylines(annotated, [jaw_np], isClosed=False, color=(0, 255, 255), thickness=2)

    # Cheekbones: 234 -> 454
    cv2.line(annotated, get_pt(234), get_pt(454), (0, 255, 0), 2)
    
    # Forehead: 103 -> 332
    cv2.line(annotated, get_pt(103), get_pt(332), (255, 0, 255), 2)

    # Vertical Axis: 10 -> 152
    cv2.line(annotated, get_pt(10), get_pt(152), (255, 255, 0), 1, cv2.LINE_AA)

    # 2. DRAW ALL LANDMARKS (Subtle Mesh Effect)
    # We'll just draw dots for a "Tech" look
    for i, lm in enumerate(landmarks):
        # Draw every 5th landmark to avoid clutter
        if i % 5 == 0:
             cx, cy = int(lm.x * w), int(lm.y * h)
             cv2.circle(annotated, (cx, cy), 1, (255, 255, 255), -1, cv2.LINE_AA)

    return annotated
