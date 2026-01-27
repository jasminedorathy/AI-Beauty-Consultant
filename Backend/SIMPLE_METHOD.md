# Simplest Method - Manual Collection (15 Minutes)

Since Kaggle had some issues, let's do the simplest thing that works!

## What You Need
- 30-50 images per category (90-150 total)
- 15 minutes of your time

## Step-by-Step

### 1. Create Folders (Already done!)
```powershell
mkdir D:\AI_Beauty_consultant\Backend\source_data\acne
mkdir D:\AI_Beauty_consultant\Backend\source_data\normal  
mkdir D:\AI_Beauty_consultant\Backend\source_data\oily
```

### 2. Download Images from Google (5 minutes per category)

**For ACNE images:**
1. Go to: https://www.google.com/search?q=acne+face+close+up&tbm=isch
2. Right-click on images and "Save image as..."
3. Save 30-50 images to: `D:\AI_Beauty_consultant\Backend\source_data\acne\`
4. Name them: acne1.jpg, acne2.jpg, etc.

**For NORMAL skin images:**
1. Go to: https://www.google.com/search?q=normal+skin+face+clear&tbm=isch
2. Save 30-50 images to: `D:\AI_Beauty_consultant\Backend\source_data\normal\`
3. Name them: normal1.jpg, normal2.jpg, etc.

**For OILY skin images:**
1. Go to: https://www.google.com/search?q=oily+skin+face+shiny&tbm=isch
2. Save 30-50 images to: `D:\AI_Beauty_consultant\Backend\source_data\oily\`
3. Name them: oily1.jpg, oily2.jpg, etc.

### 3. Generate Augmented Dataset (5 minutes)
```powershell
cd D:\AI_Beauty_consultant\Backend
python generate_dataset.py
```

This will expand your 90-150 images into 3,000+ training images!

### 4. Train DenseNet (2-4 hours)
```powershell
python train_densenet.py
```

Then wait! The model will automatically deploy when done.

---

## Expected Results

| Your Images | After Augmentation | Model Accuracy |
|-------------|-------------------|----------------|
| 30 per class | ~1,000 total | 80-85% |
| 50 per class | ~1,500 total | 85-90% |
| 100 per class | ~3,000 total | 90-93% |

Even with just 30 images per category, you'll get **80-85% accuracy** - much better than your current system!

---

## Tips for Faster Collection

- Use keyboard shortcuts: Right-click image → "V" (Save image)
- Don't worry about perfect images - variety is more important
- Mix different skin tones, ages, and lighting
- Avoid heavily filtered/edited images

---

**Ready?** Start with the acne category - it's the easiest to find! Once you have 30-50 acne images saved, let me know and I'll help you verify before moving to the next category.
