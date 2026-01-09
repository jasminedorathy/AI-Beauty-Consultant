import cv2
import numpy as np

def preprocess_for_cnn(face_img):
    face_img = cv2.resize(face_img, (224, 224))
    face_img = face_img / 255.0
    face_img = np.expand_dims(face_img, axis=0)
    return face_img
