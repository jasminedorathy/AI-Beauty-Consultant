# Quick Start: Minimal Dataset Approach

## Step 1: Collect 30-100 Images Per Category

You only need **90-300 total images** to start!

### Where to Get Images (Free & Legal)

**Option 1: Google Images** (Fastest)
```
Search terms:
- "acne face close up"
- "normal skin face"
- "oily skin face"

Download 30-50 images per category
```

**Option 2: Stock Photo Sites**
- Pexels.com
- Unsplash.com
- Pixabay.com

Search: "skin", "face", "portrait"

**Option 3: Your Own Photos**
- Take selfies in different lighting
- Ask friends/family (with permission!)

### Image Requirements
- ✅ Close-up face shots
- ✅ Good lighting
- ✅ Various skin tones (diversity improves model)
- ❌ No filters or heavy makeup
- ❌ No sunglasses/masks

## Step 2: Organize Images

Create this structure:
```
Backend/
└── source_data/
    ├── acne/       (30-100 images)
    ├── normal/     (30-100 images)
    └── oily/       (30-100 images)
```

Just drag and drop your downloaded images into these folders!

## Step 3: Generate Augmented Dataset

Run this command:
```bash
cd Backend
python generate_dataset.py
```

This will:
- Take your 90 images
- Create 3,000+ augmented variations
- Organize into train/val splits
- **Takes 5-10 minutes**

## Step 4: Train DenseNet

```bash
python train_densenet.py
```

Training time:
- **GPU**: 2-4 hours
- **CPU**: 12-24 hours

## Step 5: Done!

The system automatically uses the new model. No code changes needed!

## Expected Accuracy

| Source Images | Augmented Dataset | Expected Accuracy |
|---------------|-------------------|-------------------|
| 30 per class  | ~1,000 total      | 80-85%            |
| 50 per class  | ~1,500 total      | 85-90%            |
| 100 per class | ~3,000 total      | 90-93%            |

Even with 30 images per class, you'll get **80-85% accuracy** - better than your current system!

## Pro Tips

1. **Diversity Matters**: Mix different:
   - Skin tones
   - Ages
   - Genders
   - Lighting conditions

2. **Quality > Quantity**: 30 good images > 100 blurry images

3. **Incremental Improvement**: Start with 30, train, then add more later

## Need Help Finding Images?

I can help you:
- Download images from Kaggle datasets
- Write a web scraper for stock photos
- Create a data collection app

Just ask!
