import numpy as np
from tensorflow.keras.models import load_model
from app.ml.preprocess import preprocess_for_cnn

# Load model once
model = load_model("app/models/skin_cnn.h5")

def predict_skin_conditions(face_img):
    processed = preprocess_for_cnn(face_img)
    preds = model.predict(processed)[0]

    return {
        "acne": float(preds[0]),
        "pigmentation": float(preds[1]),
        "dryness": float(preds[2])
    }
