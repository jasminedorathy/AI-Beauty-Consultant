
from fastapi import APIRouter, UploadFile, File
from datetime import datetime

from app.auth.deps import get_current_user
from app.ml.skin_engine import enrich_skin_scores
from app.utils.image_utils import read_image
from app.pipeline.face_detection import detect_face
from app.ml.predictor import predict_skin_conditions
from app.recommender.engine import generate_recommendations
from app.mongodb.collections import analysis_collection
from app.ml.skin_engine import enrich_skin_scores
from app.pipeline.face_shape import infer_face_shape

router = APIRouter()


@router.post("/analyze")
async def analyze_face(image: UploadFile = File(...)):
    # 1. Read uploaded image
    img = read_image(image)

    # 2. Detect face
    faces = detect_face(img)
    if not faces:
        return {"error": "No face detected. Please upload a clear face image."}

    # 3. CNN Skin Analysis
    base_skin_scores = predict_skin_conditions(img)
    skin_scores = enrich_skin_scores(base_skin_scores)

    # 4. Temporary face shape (can be improved later)
    face_shape = infer_face_shape(faces[0])

    # 5. Generate recommendations
    recommendations = generate_recommendations(face_shape, skin_scores)

    # 6. Save result to MongoDB
    document = {
        "face_shape": face_shape,
        "skin_scores": skin_scores,
        "recommendations": recommendations,
        "created_at": datetime.utcnow()
    }

    analysis_collection.insert_one(document)

    # 7. Return response
    return {
        "faceShape": face_shape,
        "skinScores": skin_scores,
        "recommendations": recommendations
    }




