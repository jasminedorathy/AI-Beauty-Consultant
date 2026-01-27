import requests
import os
import uuid

BASE_URL = "http://127.0.0.1:8000"
TEMP_EMAIL = f"test_{uuid.uuid4().hex}@test.com"
TEMP_PASS = "password123"

def run_test():
    print(f"🔹 Testing with user: {TEMP_EMAIL}")
    
    # 1. Signup
    print("1. Signing up...")
    res = requests.post(f"{BASE_URL}/auth/signup", json={"email": TEMP_EMAIL, "password": TEMP_PASS})
    if res.status_code not in [200, 400]:
        print(f"❌ Signup failed: {res.text}")
        return
    
    # 2. Login
    print("2. Logging in...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": TEMP_EMAIL, "password": TEMP_PASS})
    if res.status_code != 200:
        print(f"❌ Login failed: {res.text}")
        return
    token = res.json()["access_token"]
    print("✅ Got Token!")

    # 3. Analyze
    print("3. Uploading Image...")
    # Create a dummy image if regular one not found
    img_path = "d:/AI_Beauty_consultant/Frontend/frontend/src/assets/auth_illustration.png"
    if not os.path.exists(img_path):
        # Fallback to creating a small black square
        import numpy as np
        import cv2
        img_path = "temp_test_img.jpg"
        cv2.imwrite(img_path, np.zeros((100,100,3), np.uint8))

    with open(img_path, "rb") as f:
        files = {"image": f}
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.post(f"{BASE_URL}/analyze", files=files, headers=headers)
    
    print(f"Status Code: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print("✅ Analysis Success!")
        print("Keys returned:", data.keys())
        print("Annotated URL:", data.get("annotated_image_url"))
        print("Annotated URL (Camel):", data.get("annotatedImageUrl"))
        print("Full Data:", data)
    else:
        print(f"❌ Analysis Failed: {res.text}")

if __name__ == "__main__":
    run_test()
