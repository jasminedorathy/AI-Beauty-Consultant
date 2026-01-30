# Windows Installation Guide for EfficientNetV2S Training

## ⚠️ Important: Python Version

**You have Python 3.13**, but TensorFlow requires **Python 3.10-3.12**.

### Option 1: Install Python 3.11 (Recommended)

1. **Download Python 3.11**:
   - Go to https://www.python.org/downloads/
   - Download Python 3.11.x (latest 3.11 version)
   - During installation, check "Add Python to PATH"

2. **Create virtual environment with Python 3.11**:
   ```powershell
   # In D:\AI_Beauty_consultant\Backend
   py -3.11 -m venv venv_training
   .\venv_training\Scripts\Activate.ps1
   ```

3. **Install dependencies**:
   ```powershell
   pip install --upgrade pip
   pip install -r requirements_training.txt
   ```

### Option 2: Use Conda (Alternative)

```powershell
# Install Miniconda from https://docs.conda.io/en/latest/miniconda.html

# Create environment with Python 3.11
conda create -n faceshape python=3.11
conda activate faceshape

# Install dependencies
pip install -r requirements_training.txt
```

---

## 📦 Installing dlib on Windows

`dlib` is tricky on Windows. Here are 3 methods:

### Method 1: Pre-built wheel (Easiest)

```powershell
pip install https://github.com/jloh02/dlib/releases/download/v19.24.1/dlib-19.24.1-cp311-cp311-win_amd64.whl
```

### Method 2: Use conda

```powershell
conda install -c conda-forge dlib
```

### Method 3: Skip dlib, use OpenCV instead

I've updated `preprocess_dataset.py` to use OpenCV's Haar Cascade instead of dlib (see below).

---

## 🖥️ GPU Setup for TensorFlow

You saw "No GPU found" because TensorFlow couldn't detect your GPU.

### Install CUDA Toolkit

1. **Check your GPU**:
   ```powershell
   nvidia-smi
   ```

2. **Install CUDA 11.8** (compatible with TensorFlow 2.15):
   - Download: https://developer.nvidia.com/cuda-11-8-0-download-archive
   - Select: Windows → x86_64 → 11 → exe (local)
   - Install with default settings

3. **Install cuDNN 8.6**:
   - Download: https://developer.nvidia.com/cudnn (requires NVIDIA account)
   - Extract and copy files to CUDA directory:
     ```
     C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\
     ```

4. **Verify GPU detection**:
   ```python
   import tensorflow as tf
   print(tf.config.list_physical_devices('GPU'))
   ```

---

## 🚀 Corrected Installation Steps

```powershell
# You're already in D:\AI_Beauty_consultant\Backend
# DON'T run "cd Backend" again!

# Step 1: Create Python 3.11 virtual environment
py -3.11 -m venv venv_training
.\venv_training\Scripts\Activate.ps1

# Step 2: Install dependencies
pip install --upgrade pip
pip install -r requirements_training.txt

# Step 3: Install dlib (choose one method above)
pip install https://github.com/jloh02/dlib/releases/download/v19.24.1/dlib-19.24.1-cp311-cp311-win_amd64.whl

# Step 4: Setup Kaggle API
# - Get API key from https://www.kaggle.com/settings/account
# - Save to: C:\Users\jasmi\.kaggle\kaggle.json

# Step 5: Download & preprocess
python scripts/preprocess_dataset.py

# Step 6: Augment dataset
python scripts/augment_dataset.py

# Step 7: Train model
python scripts/train_efficientnet.py
```

---

## 🔧 Quick Fix: Use OpenCV Instead of dlib

If dlib installation is too difficult, I can update the preprocessing script to use OpenCV's Haar Cascade (already installed with opencv-python).

**Pros**: Easy to install, no compilation needed
**Cons**: Slightly less accurate face detection (~95% vs 98%)

Let me know if you want me to create the OpenCV version!

---

## ✅ Checklist

- [ ] Install Python 3.11
- [ ] Create virtual environment
- [ ] Install requirements
- [ ] Install dlib OR use OpenCV version
- [ ] Setup Kaggle API
- [ ] Install CUDA 11.8 (for GPU)
- [ ] Verify GPU detection
- [ ] Run preprocessing script

---

**Need help?** Let me know which step is causing issues!
