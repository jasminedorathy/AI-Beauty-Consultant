from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils.image_utils import read_image
from app.pipeline.face_detection import detect_faces
from app.ml.predictor import predict_skin_conditions
from app.auth.jwt_handler import verify_access_token
from app.mongodb.collections import analysis_collection
from app.ml.analysis_cv import calculate_face_shape, analyze_skin_cv, generate_annotated_image
from app.ml.consultant import generate_consultation
import cv2
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
                "gender": "N/A",
                "skinScores": {},
                "recommendations": [],
                "error": "No face detected. Please ensure the face is clearly visible."
            }

        # Use the first detected face
        face_data = faces[0]
        bbox = face_data["bbox"]
        landmarks = face_data["landmarks"]
        
        x, y, w, h = bbox
        
        # 1. Face Shape & Gender Analysis
        from app.ml.analysis_cv import classify_gender_geometric
        
        # Unpack tuple (Shape, Confidence)
        shape_name, shape_conf = calculate_face_shape(landmarks, img.shape[1], img.shape[0])
        gender = classify_gender_geometric(landmarks, img.shape[1], img.shape[0], img)

        # 2. Skin Analysis (OpenCV)
        face_img = img[y:y+h, x:x+w]
        skin_scores = analyze_skin_cv(face_img, landmarks) 

        # 3. COLOR ANALYSIS (NEW) - Skin Tone, Eye Color, Hair Color
        from app.ml.color_analysis import (
            detect_skin_tone, 
            detect_eye_color, 
            detect_hair_color,
            get_seasonal_color_palette
        )
        
        skin_tone, undertone, skin_hex = detect_skin_tone(img, landmarks)
        eye_color, eye_hex = detect_eye_color(img, landmarks)
        hair_color, hair_hex = detect_hair_color(img, landmarks)
        season, palette = get_seasonal_color_palette(skin_tone, undertone, eye_color, hair_color)

        # 4. Generate Consultant Recommendations (Pass all color data)
        recommendations = generate_consultation(
            shape_name, skin_scores, gender, img, landmarks,
            skin_tone=skin_tone, undertone=undertone,
            eye_color=eye_color, hair_color=hair_color,
            season=season
        )

        # --- GENERATE ANNOTATED IMAGE ---
        annotated_img = generate_annotated_image(img, landmarks, gender)
        
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
                "face_shape": shape_name,
                "face_shape_conf": shape_conf,
                "gender": gender,
                "skin_scores": skin_scores,
                # Color Analysis Data
                "skin_tone": skin_tone,
                "undertone": undertone,
                "eye_color": eye_color,
                "hair_color": hair_color,
                "season": season,
                "recommendations": recommendations,
                "created_at": datetime.utcnow()
            }
            analysis_collection.insert_one(analysis_doc)
            print(f"✅ Saved analysis for user {current_user.get('sub')}")

        except Exception as db_err:
            print(f"⚠️ DB Save Failed: {db_err}")
            image_url = None
            annotated_image_url = None

        # --- RETURN RESPONSE ---
        return {
            "success": True,
            "data": {
                "face_shape": shape_name,
                "confidence": float(shape_conf),
                "gender": gender,
                "skin_analysis": {
                    "acne": float(skin_scores.get('acne', 0)),
                    "oiliness": float(skin_scores.get('oiliness', 0)),
                    "texture": float(skin_scores.get('texture', 0))
                },
                "color_analysis": {
                    "skin_tone": skin_tone,
                    "undertone": undertone,
                    "skin_hex": skin_hex,
                    "eye_color": eye_color,
                    "eye_hex": eye_hex,
                    "hair_color": hair_color,
                    "hair_hex": hair_hex,
                    "season": season
                },
                "recommendations": recommendations,
                "image_url": image_url,
                "annotated_image_url": annotated_image_url
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Internal Server Error: {str(e)}"}

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    try:
        email = current_user.get("sub")
        # Fetch last 20 records, sorted by date DESC
        # Note: In pymongo, find() returns a cursor, we need to list() it.
        history = list(analysis_collection.find({"user_email": email}).sort("created_at", -1).limit(20))
        
        # Convert ObjectId and DateTime to string
        for item in history:
            item["id"] = str(item["_id"])
            del item["_id"]
            if "created_at" in item:
                item["date"] = item["created_at"].strftime("%Y-%m-%d")
                item["time"] = item["created_at"].strftime("%H:%M")
                del item["created_at"]
                
        return history
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

# --- AI CONSULTANT CHATBOT (LLM POWERED) ---
from pydantic import BaseModel
import requests
import json
import os

class ChatRequest(BaseModel):
    message: str

def load_api_key():
    # Simple .env loader since python-dotenv might not be present
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("OPENROUTER_API_KEY"):
                    return line.strip().split("=")[1]
    except:
        return None
    return None


@router.post("/chat")
async def chat_consultant(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Beauty Consultant Chatbot using local rule-based AI.
    Provides intelligent responses based on user context without external API dependencies.
    """
    msg = req.message
    email = current_user.get("sub")
    
    # 1. RETRIEVE USER CONTEXT
    last_scan = analysis_collection.find_one({"user_email": email}, sort=[("created_at", -1)])
    
    # Prepare context for chatbot
    user_context = None
    if last_scan:
        user_context = {
            "gender": last_scan.get("gender", "Female"),
            "face_shape": last_scan.get("face_shape", "Unknown"),
            "skin_scores": last_scan.get("skin_scores", {}),
            "skin_tone": last_scan.get("skin_tone"),
            "undertone": last_scan.get("undertone"),
            "eye_color": last_scan.get("eye_color"),
            "hair_color": last_scan.get("hair_color"),
            "season": last_scan.get("season")
        }
    
    # 2. GENERATE RESPONSE USING LOCAL CHATBOT
    from app.ml.chatbot import get_bot_response
    
    try:
        reply = get_bot_response(msg, user_context)
        print(f"💬 Chatbot Response: {reply[:100]}...")
        return {"reply": reply}
    except Exception as e:
        print(f"⚠️ Chatbot Error: {e}")
        return {"reply": "I'm here to help! Ask me about skincare, makeup, hairstyles, or our salon services. ✨"}

