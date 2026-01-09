import cv2
import numpy as np

def read_image(uploaded_file):
    """
    Convert FastAPI UploadFile into OpenCV image (NumPy array)
    """
    # Read file bytes
    file_bytes = np.frombuffer(uploaded_file.file.read(), np.uint8)

    # Decode image
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    return image
