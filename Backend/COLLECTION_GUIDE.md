# Complete Dataset Collection Guide

## Overview
You now have **3 automated methods** to collect skin images:

| Method | Speed | Quality | Setup Difficulty |
|--------|-------|---------|------------------|
| 1. Kaggle | ⚡⚡⚡ Fast | ⭐⭐⭐ Excellent | Easy (API key) |
| 2. Stock Photos | ⚡⚡ Medium | ⭐⭐⭐ Excellent | Easy (API keys) |
| 3. Google Images | ⚡ Slow | ⭐⭐ Good | Medium (Browser) |

## Quick Start (Easiest Path)

### Option A: Run All Methods
```bash
python collect_all.py
```

This will guide you through all three methods interactively.

### Option B: Run Individual Methods

#### Method 1: Kaggle (Recommended - Fastest)
```bash
# 1. Get API key from https://www.kaggle.com/settings
# 2. Download kaggle.json
# 3. Place in C:/Users/<username>/.kaggle/
# 4. Run:
python collect_kaggle.py
```

**Downloads**: 10,000+ professional dermatology images

#### Method 2: Stock Photos (Best Quality)
```bash
# 1. Get Pexels key: https://www.pexels.com/api/ (instant, free)
# 2. Get Unsplash key: https://unsplash.com/developers (instant, free)
# 3. Update API keys in collect_stock.py
# 4. Run:
python collect_stock.py
```

**Downloads**: 150 high-quality stock photos (50 per category)

#### Method 3: Google Images (No API Needed)
```bash
# 1. Install Chrome browser
# 2. Run:
python collect_google.py
```

**Downloads**: 150 images via browser automation

## After Collection

### Step 1: Organize Data
```bash
# Automatically organize all collected images
python collect_all.py organize
```

This moves everything to `source_data/acne`, `source_data/normal`, `source_data/oily`

### Step 2: Generate Augmented Dataset
```bash
python generate_dataset.py
```

Expands your images 10x with augmentation (e.g., 300 → 3,000 images)

### Step 3: Train DenseNet
```bash
python train_densenet.py
```

## Recommended Workflow

**For Maximum Speed** (30 minutes total):
1. Run `python collect_kaggle.py` (10 min)
2. Run `python collect_stock.py` (10 min)
3. Run `python generate_dataset.py` (5 min)
4. Run `python train_densenet.py` (2-4 hours)

**For Best Quality** (1 hour total):
1. Run all three methods via `python collect_all.py`
2. Manually review and delete bad images
3. Run `python generate_dataset.py`
4. Run `python train_densenet.py`

## Troubleshooting

### "Kaggle API not configured"
- Go to https://www.kaggle.com/settings
- Click "Create New API Token"
- Save kaggle.json to `C:/Users/<your-username>/.kaggle/`

### "Pexels/Unsplash API error"
- Check API keys are correct in `collect_stock.py`
- Free tier limits: 200 requests/hour (plenty for our needs)

### "Chrome driver not found"
- Download: https://chromedriver.chromium.org/
- Or run: `pip install webdriver-manager`

## Expected Results

| Collection Method | Images Collected | Time Required |
|-------------------|------------------|---------------|
| Kaggle only | 1,000-10,000 | 10-20 min |
| Stock Photos only | 150 | 10-15 min |
| Google Images only | 150 | 20-30 min |
| **All Three** | **1,300-10,000+** | **40-60 min** |

After augmentation: **13,000-100,000+ training images**

## Files Created

```
Backend/
├── collect_kaggle.py      # Method 1
├── collect_stock.py       # Method 2
├── collect_google.py      # Method 3
├── collect_all.py         # Master script
├── generate_dataset.py    # Augmentation
├── train_densenet.py      # Training
└── source_data/           # Final organized data
    ├── acne/
    ├── normal/
    └── oily/
```

## Need Help?

Run any script with `--help` or just run it - they all have interactive guides!
