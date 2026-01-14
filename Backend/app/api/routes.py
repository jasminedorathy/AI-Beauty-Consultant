from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.image_utils import read_image
from app.pipeline.face_detection import detect_faces
from app.ml.predictor import predict_skin_conditions
from app.auth.jwt_handler import verify_access_token
from app.mongodb.collections import analysis_collection
import os
import uuid
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

@router.post("/analyze")
async def analyze_face(image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        print(f"🔍 STARTING ANALYSIS for user: {current_user.get('sub')}")
        img_bytes = await image.read()
        img = read_image(img_bytes)
        
        if img is None:
             return {"error": "Failed to decode image. Please upload a valid image file."}

        faces = detect_faces(img)

        if len(faces) == 0:
            return {
                "faceShape": "N/A",
                "skinScores": {},
                "recommendations": [],
                "error": "No face detected. Please ensure the face is clearly visible."
            }

        # Use the first detected face
        face_data = faces[0]
        bbox = face_data["bbox"]
        landmarks = face_data["landmarks"]
        
        x, y, w, h = bbox
        
        # 1. Face Shape Analysis (Geometric)
        from app.ml.analysis_cv import calculate_face_shape, analyze_skin_cv
        face_shape = calculate_face_shape(landmarks, img.shape[1], img.shape[0])

        # 2. Skin Analysis (OpenCV)
        face_img = img[y:y+h, x:x+w]
        # We pass the full image and landmarks for potential context, 
        # but for now analyze_skin_cv uses ROI inside face_img if we passed it, 
        # or we can pass face_img directly. 
        # Let's pass face_img to focus analysis on the face crop.
        skin_scores = analyze_skin_cv(face_img, landmarks) 
        
        # Generate recommendations based on REAL CV scores
        recommendations = []
        if skin_scores.get("acne", 0) > 0.3:
            recommendations.append("High redness detected. Consider soothing ingredients like Aloe or Niacinamide.")
        if skin_scores.get("oiliness", 0) > 0.4:
            recommendations.append("Shiny zones detected. Use oil-free moisturizers and clay masks.")
        if skin_scores.get("texture", 0) > 0.5: # Roughness
            recommendations.append("Uneven texture detected. Gentle exfoliation with AHAs might help.")
        
        if not recommendations:
            recommendations.append("Your skin looks balanced! Maintain your current routine.")

        # --- GENERATE ANNOTATED IMAGE ---
        from app.ml.analysis_cv import generate_annotated_image
        annotated_img = generate_annotated_image(img, landmarks)
        
        # --- SAVE TO DB & DISK ---
        try:
            # 1. Save Original Image
            import uuid
            filename = f"{uuid.uuid4().hex}.jpg"
            file_path = os.path.join("static/uploads", filename)
            
            # Write original bytes
            with open(file_path, "wb") as f:
                f.write(img_bytes)

            # 2. Save Annotated Image
            annotated_filename = f"annotated_{filename}"
            annotated_path = os.path.join("static/uploads", annotated_filename)
            cv2.imwrite(annotated_path, annotated_img)

            base_url = "http://127.0.0.1:8000"
            image_url = f"{base_url}/static/uploads/{filename}"
            annotated_image_url = f"{base_url}/static/uploads/{annotated_filename}"

            # 3. Save Result to DB
            analysis_doc = {
                "user_email": current_user.get("sub"),
                "image_url": image_url,
                "annotated_image_url": annotated_image_url,
                "face_shape": face_shape,
                "skin_scores": skin_scores,
                "recommendations": recommendations,
                "created_at": datetime.utcnow()
            }
            analysis_collection.insert_one(analysis_doc)
            print(f"✅ Saved analysis for user {current_user.get('sub')}")

        except Exception as db_err:
            print(f"⚠️ Failed to save to DB: {db_err}")
            # Ensure we still return values even if DB fails
            annotated_image_url = None
            if 'image_url' not in locals():
                 image_url = None
            # We don't block the response if DB fails, but we log it.

        return {
            "faceShape": face_shape,
            "skinScores": skin_scores,
            "recommendations": recommendations,
            "boundingBox": {"x": x, "y": y, "w": w, "h": h},
            "imageUrl": image_url if 'image_url' in locals() else None,
            "annotated_image_url": annotated_image_url if 'annotated_image_url' in locals() else None,
            "annotatedImageUrl": annotated_image_url if 'annotated_image_url' in locals() else None
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Internal Server Error: {str(e)}"}
