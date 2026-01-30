# GPU Detection Fix - Step-by-Step Guide

## Problem: TensorFlow Cannot See GPU

**Root Cause**: Python 3.13 is not compatible with TensorFlow GPU support.  
**Solution**: Use Python 3.11 with TensorFlow 2.15

---

## Step 1: Install Python 3.11 (10 minutes)

1. **Download Python 3.11**:
   - Go to: https://www.python.org/downloads/release/python-3118/
   - Scroll down to "Files"
   - Download: **Windows installer (64-bit)**

2. **Install Python 3.11**:
   - Run the installer
   - ✅ **CHECK**: "Add Python 3.11 to PATH"
   - Click "Install Now"
   - Wait for installation

3. **Verify Installation**:
   ```powershell
   py -3.11 --version
   # Should show: Python 3.11.8
   ```

---

## Step 2: Create GPU Virtual Environment (5 minutes)

```powershell
# Navigate to Backend folder
cd D:\AI_Beauty_consultant\Backend

# Create virtual environment with Python 3.11
py -3.11 -m venv venv_gpu

# Activate the environment
.\venv_gpu\Scripts\Activate.ps1

# Verify Python version
python --version
# Should show: Python 3.11.x
```

---

## Step 3: Install TensorFlow with GPU Support (10 minutes)

```powershell
# Make sure venv_gpu is activated (you should see (venv_gpu) in prompt)

# Upgrade pip
python -m pip install --upgrade pip

# Install TensorFlow 2.15 (compatible with CUDA 11.8)
pip install tensorflow==2.15.0

# Install other training dependencies
pip install -r requirements_training.txt
```

---

## Step 4: Verify GPU Detection (1 minute)

```powershell
# Test GPU detection
python -c "import tensorflow as tf; print('TensorFlow:', tf.__version__); print('GPU:', tf.config.list_physical_devices('GPU'))"
```

**Expected Output**:
```
TensorFlow: 2.15.0
GPU: [PhysicalDevice(name='/physical_device:GPU:0', device_type='GPU')]
```

**If still shows empty `[]`**, continue to Step 5.

---

## Step 5: Troubleshooting (if GPU still not detected)

### Check 1: Verify CUDA Version

```powershell
nvcc --version
```

**Expected**: `Cuda compilation tools, release 11.8`

**If different version**: TensorFlow 2.15 needs CUDA 11.8  
**If command not found**: CUDA not in PATH

### Check 2: Verify cuDNN Files

```powershell
dir "C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\cudnn*.dll"
```

**Expected**: Should list several cudnn DLL files

**If not found**: cuDNN not installed correctly
1. Re-download cuDNN 8.6 for CUDA 11.x
2. Extract ZIP
3. Copy `bin`, `include`, `lib` folders to CUDA directory

### Check 3: Install Visual C++ Redistributable

TensorFlow GPU needs Visual C++ runtime:

1. Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Install and restart computer

### Check 4: Set Environment Variables

```powershell
# Check if CUDA paths are in PATH
$env:PATH -split ';' | Select-String -Pattern "CUDA"
```

**Should include**:
- `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin`
- `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\libnvvp`

**If missing**, add them:
1. Win + R → `sysdm.cpl`
2. Advanced → Environment Variables
3. System Variables → PATH → Edit → New
4. Add both paths above
5. Restart PowerShell

---

## Step 6: Final GPU Test

```powershell
# Activate GPU environment
.\venv_gpu\Scripts\Activate.ps1

# Comprehensive GPU test
python -c "
import tensorflow as tf
print('='*60)
print('TensorFlow version:', tf.__version__)
print('GPU Available:', tf.test.is_gpu_available())
print('GPU Devices:', tf.config.list_physical_devices('GPU'))
print('='*60)

# Test GPU computation
if len(tf.config.list_physical_devices('GPU')) > 0:
    with tf.device('/GPU:0'):
        a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
        b = tf.constant([[1.0, 1.0], [0.0, 1.0]])
        c = tf.matmul(a, b)
        print('✅ GPU computation successful!')
        print(c)
else:
    print('❌ No GPU detected')
"
```

---

## Common Issues & Solutions

### Issue: "Could not load dynamic library 'cudart64_110.dll'"

**Solution**: Version mismatch
```powershell
pip uninstall tensorflow
pip install tensorflow==2.15.0
```

### Issue: "Failed to create session"

**Solution**: GPU memory issue
```python
# Add to training script
import tensorflow as tf
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    tf.config.experimental.set_memory_growth(gpus[0], True)
```

### Issue: Still no GPU after all steps

**Last Resort Options**:
1. **Use Google Colab** (free GPU, no setup)
2. **Train on CPU** (slow but works)
3. **Use cloud GPU** (AWS, GCP, Azure)

---

## Success Checklist

- [ ] Python 3.11 installed
- [ ] Virtual environment created (`venv_gpu`)
- [ ] TensorFlow 2.15 installed
- [ ] GPU detected by TensorFlow
- [ ] GPU computation test passes

---

## Next Steps After GPU Works

```powershell
# Download dataset
python scripts/preprocess_dataset.py

# Augment dataset
python scripts/augment_dataset.py

# Start training
python scripts/train_efficientnet.py
```

**Training time with GPU**: 40-50 hours  
**Target accuracy**: 96%+

---

**Need help?** Run each step and let me know where you get stuck!
