"""
Face Shape Dataset Preprocessing Script
Downloads and preprocesses face shape dataset for EfficientNetV2S training

Steps:
1. Download dataset from Kaggle
2. Detect faces using HOG + SVM
3. Crop faces to square regions
4. Resize to 150x150 pixels
5. Save preprocessed images
"""

import os
import cv2
import dlib
import numpy as np
from pathlib import Path
import shutil
from tqdm import tqdm

# Configuration
DATASET_URL = "niten19/face-shape-dataset"
ORIGINAL_DIR = "datasets/face_shape_original"
CROPPED_DIR = "datasets/face_shape_cropped"
TARGET_SIZE = 150

# Face shape classes
CLASSES = ["Heart", "Oblong", "Oval", "Round", "Square"]

# Initialize face detector (HOG + Linear SVM)
detector = dlib.get_frontal_face_detector()


def download_dataset():
    """Download face shape dataset from Kaggle"""
    print("📥 Downloading dataset from Kaggle...")
    
    # Check if kaggle is installed
    try:
        import kaggle
    except ImportError:
        print("❌ Kaggle API not installed. Installing...")
        os.system("pip install kaggle")
        import kaggle
    
    # Check if Kaggle credentials exist
    kaggle_dir = Path.home() / ".kaggle"
    if not (kaggle_dir / "kaggle.json").exists():
        print("\n⚠️  Kaggle credentials not found!")
        print("Please follow these steps:")
        print("1. Go to https://www.kaggle.com/settings/account")
        print("2. Scroll to 'API' section")
        print("3. Click 'Create New Token'")
        print(f"4. Move downloaded kaggle.json to: {kaggle_dir}")
        print("5. Run this script again")
        return False
    
    # Download dataset
    os.makedirs(ORIGINAL_DIR, exist_ok=True)
    os.system(f"kaggle datasets download -d {DATASET_URL} -p {ORIGINAL_DIR}")
    
    # Unzip dataset
    import zipfile
    zip_files = list(Path(ORIGINAL_DIR).glob("*.zip"))
    if zip_files:
        print(f"📦 Extracting {zip_files[0]}...")
        with zipfile.ZipFile(zip_files[0], 'r') as zip_ref:
            zip_ref.extractall(ORIGINAL_DIR)
        zip_files[0].unlink()  # Remove zip file
    
    print("✅ Dataset downloaded successfully!")
    return True


def detect_and_crop_face(image_path):
    """
    Detect face in image and return cropped face region
    
    Args:
        image_path: Path to input image
        
    Returns:
        cropped_face: 150x150 face image or None if no face detected
    """
    # Read image
    img = cv2.imread(str(image_path))
    if img is None:
        return None
    
    # Convert to RGB (dlib uses RGB)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Detect faces
    faces = detector(rgb, 1)
    
    if len(faces) == 0:
        return None
    
    # Use first detected face
    face = faces[0]
    
    # Get face bounding box
    x1, y1, x2, y2 = face.left(), face.top(), face.right(), face.bottom()
    
    # Add padding (10% on each side)
    h, w = img.shape[:2]
    padding = int((x2 - x1) * 0.1)
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(w, x2 + padding)
    y2 = min(h, y2 + padding)
    
    # Crop face
    face_crop = img[y1:y2, x1:x2]
    
    # Make square (use larger dimension)
    h_crop, w_crop = face_crop.shape[:2]
    size = max(h_crop, w_crop)
    
    # Create square canvas
    square = np.zeros((size, size, 3), dtype=np.uint8)
    
    # Center the face
    y_offset = (size - h_crop) // 2
    x_offset = (size - w_crop) // 2
    square[y_offset:y_offset+h_crop, x_offset:x_offset+w_crop] = face_crop
    
    # Resize to target size
    resized = cv2.resize(square, (TARGET_SIZE, TARGET_SIZE), interpolation=cv2.INTER_AREA)
    
    return resized


def preprocess_dataset():
    """Preprocess all images in dataset"""
    print("\n🔄 Preprocessing dataset...")
    
    # Create output directory
    os.makedirs(CROPPED_DIR, exist_ok=True)
    
    stats = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "per_class": {}
    }
    
    # Process each class
    for class_name in CLASSES:
        print(f"\n📂 Processing {class_name} faces...")
        
        # Find class directory
        class_dirs = list(Path(ORIGINAL_DIR).rglob(class_name))
        if not class_dirs:
            print(f"⚠️  {class_name} directory not found, skipping...")
            continue
        
        class_dir = class_dirs[0]
        output_class_dir = Path(CROPPED_DIR) / class_name
        output_class_dir.mkdir(parents=True, exist_ok=True)
        
        # Get all images
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            image_files.extend(class_dir.glob(ext))
        
        stats["per_class"][class_name] = {"total": 0, "success": 0, "failed": 0}
        
        # Process each image
        for img_path in tqdm(image_files, desc=f"{class_name}"):
            stats["total"] += 1
            stats["per_class"][class_name]["total"] += 1
            
            # Detect and crop face
            cropped = detect_and_crop_face(img_path)
            
            if cropped is not None:
                # Save cropped face
                output_path = output_class_dir / img_path.name
                cv2.imwrite(str(output_path), cropped)
                stats["success"] += 1
                stats["per_class"][class_name]["success"] += 1
            else:
                stats["failed"] += 1
                stats["per_class"][class_name]["failed"] += 1
    
    # Print statistics
    print("\n" + "="*60)
    print("📊 PREPROCESSING STATISTICS")
    print("="*60)
    print(f"Total images processed: {stats['total']}")
    print(f"✅ Successfully cropped: {stats['success']} ({stats['success']/stats['total']*100:.1f}%)")
    print(f"❌ Failed (no face detected): {stats['failed']} ({stats['failed']/stats['total']*100:.1f}%)")
    print("\nPer-class breakdown:")
    for class_name, class_stats in stats["per_class"].items():
        success_rate = class_stats['success'] / class_stats['total'] * 100 if class_stats['total'] > 0 else 0
        print(f"  {class_name:10s}: {class_stats['success']:4d}/{class_stats['total']:4d} ({success_rate:.1f}%)")
    print("="*60)
    
    return stats


def verify_dataset():
    """Verify preprocessed dataset"""
    print("\n🔍 Verifying preprocessed dataset...")
    
    for class_name in CLASSES:
        class_dir = Path(CROPPED_DIR) / class_name
        if class_dir.exists():
            count = len(list(class_dir.glob("*.jpg"))) + len(list(class_dir.glob("*.png")))
            print(f"  {class_name:10s}: {count:4d} images")
        else:
            print(f"  {class_name:10s}: Directory not found!")


if __name__ == "__main__":
    print("="*60)
    print("🎯 FACE SHAPE DATASET PREPROCESSING")
    print("="*60)
    
    # Step 1: Download dataset
    if not Path(ORIGINAL_DIR).exists() or not list(Path(ORIGINAL_DIR).rglob("*.jpg")):
        if not download_dataset():
            print("❌ Failed to download dataset. Exiting...")
            exit(1)
    else:
        print("✅ Dataset already downloaded, skipping download...")
    
    # Step 2: Preprocess dataset
    stats = preprocess_dataset()
    
    # Step 3: Verify dataset
    verify_dataset()
    
    print("\n✅ Preprocessing complete!")
    print(f"📁 Preprocessed images saved to: {CROPPED_DIR}")
    print("\n📝 Next steps:")
    print("1. Review preprocessed images")
    print("2. Run augmentation script: python scripts/augment_dataset.py")
    print("3. Train model: python scripts/train_efficientnet.py")
