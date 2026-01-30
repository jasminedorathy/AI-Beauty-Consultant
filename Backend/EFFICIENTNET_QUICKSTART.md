# EfficientNetV2S Face Shape Classification - Quick Start Guide

## 🎯 Goal
Train a state-of-the-art face shape classifier achieving **96.32% accuracy** using EfficientNetV2S with transfer learning.

---

## 📋 Prerequisites

### Hardware
- **GPU**: NVIDIA with 6GB+ VRAM (GTX 1660 or better) ✅ You have this!
- **RAM**: 16GB+
- **Storage**: 10GB free space

### Software
- Python 3.8+
- CUDA 11.2+ (for GPU support)
- Git

---

## 🚀 Step-by-Step Instructions

### Step 1: Install Training Dependencies (5 minutes)

```bash
cd Backend
pip install -r requirements_training.txt
```

**Note**: TensorFlow installation may take 5-10 minutes.

---

### Step 2: Setup Kaggle API (10 minutes)

1. **Create Kaggle account** (if you don't have one):
   - Go to https://www.kaggle.com/
   - Sign up for free

2. **Get API credentials**:
   - Go to https://www.kaggle.com/settings/account
   - Scroll to "API" section
   - Click "Create New Token"
   - Download `kaggle.json`

3. **Install credentials**:
   ```bash
   # Windows
   mkdir %USERPROFILE%\.kaggle
   move kaggle.json %USERPROFILE%\.kaggle\
   
   # Linux/Mac
   mkdir -p ~/.kaggle
   mv kaggle.json ~/.kaggle/
   chmod 600 ~/.kaggle/kaggle.json
   ```

---

### Step 3: Download & Preprocess Dataset (30-60 minutes)

```bash
cd Backend
python scripts/preprocess_dataset.py
```

**What this does**:
- Downloads 5000 face images from Kaggle
- Detects faces using HOG + SVM
- Crops faces to square regions
- Resizes to 150x150 pixels
- Saves to `datasets/face_shape_cropped/`

**Expected output**: ~4000 preprocessed images (some fail face detection)

---

### Step 4: Augment Dataset (1-2 hours)

```bash
python scripts/augment_dataset.py
```

**What this does**:
- Creates 5 variants per image:
  1. Original
  2. Rotation (-50° to +30°)
  3. Gaussian noise
  4. Horizontal flip + rotation
  5. Contrast adjustment + rotation
- Saves to `datasets/face_shape_augmented/`

**Expected output**: ~20,000-25,000 augmented images

---

### Step 5: Train Model (40-50 hours with GTX 1660)

```bash
python scripts/train_efficientnet.py
```

**What this does**:
- Loads pretrained EfficientNetV2S (ImageNet weights)
- Trains on augmented dataset
- 500 epochs, batch size 16
- Saves best model to `models/face_shape_efficientnet_best.h5`

**Training time estimates**:
- GTX 1660 (6GB): ~40-50 hours
- RTX 3060 (12GB): ~20-25 hours
- RTX 4090 (24GB): ~10-15 hours

**Tip**: Training can run overnight! The script has early stopping and will save the best model automatically.

**Monitor training**:
```bash
# In another terminal
tensorboard --logdir=Backend/models/logs
```
Then open http://localhost:6006 in browser

---

### Step 6: Evaluate Model (5 minutes)

After training completes, check the results:

```bash
# View training history plot
# Open: Backend/models/training_history.png

# View training info
cat Backend/models/training_info.json
```

**Expected results**:
- Validation accuracy: >96%
- Training accuracy: >86%

---

## 📊 Expected Timeline

| Step | Duration | Can Run Overnight? |
|------|----------|-------------------|
| Install dependencies | 5-10 min | No |
| Setup Kaggle | 10 min | No |
| Download & preprocess | 30-60 min | Yes |
| Augment dataset | 1-2 hours | Yes |
| **Train model** | **40-50 hours** | **Yes** ✅ |
| Evaluate | 5 min | No |
| **Total active time** | **~2 hours** | |
| **Total elapsed time** | **~2-3 days** | |

---

## 🎯 Success Criteria

✅ Preprocessing: ~4000 cropped images  
✅ Augmentation: ~20,000+ augmented images  
✅ Training: Validation accuracy >96%  
✅ Model file: `face_shape_efficientnet_best.h5` (~200MB)  

---

## 🐛 Troubleshooting

### Issue: "No GPU found"
**Solution**: 
```bash
# Check CUDA installation
nvidia-smi

# Install CUDA toolkit if missing
# Download from: https://developer.nvidia.com/cuda-downloads
```

### Issue: "Kaggle API credentials not found"
**Solution**: Follow Step 2 carefully. Make sure `kaggle.json` is in the correct location.

### Issue: "Out of memory during training"
**Solution**: Reduce batch size in `train_efficientnet.py`:
```python
BATCH_SIZE = 8  # Instead of 16
```

### Issue: "Training is too slow"
**Solution**: 
- Make sure GPU is being used (check script output)
- Close other GPU-intensive applications
- Consider using Google Colab with free GPU

---

## 📝 Next Steps After Training

1. **Integrate into backend** (Week 3 of plan)
2. **Test on real images**
3. **Deploy updated model**

See `efficientnet_implementation_plan.md` for full integration plan.

---

## 🆘 Need Help?

- Check training logs: `Backend/models/training_log_*.csv`
- View TensorBoard: `tensorboard --logdir=Backend/models/logs`
- Review implementation plan: `efficientnet_implementation_plan.md`

---

**Ready to start?** Run Step 1! 🚀
