import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Load Face Landmarker model
base_options = python.BaseOptions(
    model_asset_path="app/models/face_landmarker.task"
)

options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1
)

face_landmarker = vision.FaceLandmarker.create_from_options(options)


def detect_face(image):
    """
    Detect face landmarks using MediaPipe Tasks API
    """
    if image is None:
        return None

    # Convert OpenCV BGR -> RGB
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # ✅ CORRECT way to create MediaPipe Image
    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_image
    )

    result = face_landmarker.detect(mp_image)
    return result.face_landmarks
