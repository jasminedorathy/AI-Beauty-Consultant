import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.layers import InputLayer, DepthwiseConv2D
from app.ml.preprocess import preprocess_for_cnn
import os

class CustomInputLayer(InputLayer):
    @classmethod
    def from_config(cls, config):
        # Remove unrecognized arguments for compatibility
        config.pop('batch_shape', None)
        config.pop('optional', None)
        
        # Ensure shape is present (InputLayer requires it in newer Keras/TF versions)
        if 'batch_input_shape' in config and 'shape' not in config:
            # Use batch_input_shape as shape (excluding batch dimension if None)
            batch_input_shape = config['batch_input_shape']
            config['shape'] = batch_input_shape[1:] if batch_input_shape and batch_input_shape[0] is None else batch_input_shape
            
        # Fallback if neither exists (though unlikely for valid config)
        if 'shape' not in config:
             config['shape'] = (224, 224, 3) # Default for this model
             
        return super().from_config(config)

class CustomDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, **kwargs):
        # Remove 'groups' if present, as it might validly be 1 but cause issues in some versions
        kwargs.pop('groups', None) 
        super().__init__(**kwargs)

    @classmethod
    def from_config(cls, config):
        config.pop('groups', None)
        return super().from_config(config)

# Load model once with custom objects
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/skin_cnn.h5")
print(f"Loading model from: {MODEL_PATH}")

try:
    model = load_model(MODEL_PATH, custom_objects={
        'InputLayer': CustomInputLayer,
        'DepthwiseConv2D': CustomDepthwiseConv2D
    })
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    model = None

def predict_skin_conditions(face_img):
    if model is None:
        return {
            "acne": 0.0,
            "pigmentation": 0.0,
            "dryness": 0.0,
            "error": "Model not loaded"
        }

    processed = preprocess_for_cnn(face_img)
    preds = model.predict(processed)[0]

    # Assuming the model returns [acne, pigmentation, dryness]
    # Adjust indices if your model has a different output structure
    
    return {
        "acne": float(preds[0]),
        "pigmentation": float(preds[1]),
        "dryness": float(preds[2]) if len(preds) > 2 else 0.0
    }
