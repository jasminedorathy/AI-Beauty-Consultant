# Quick Setup Guide - Get Your Dataset in 10 Minutes!

## The Issue
The Google Images scraper didn't download images successfully. Let's use the **Kaggle method** instead - it's faster and more reliable!

## Step-by-Step Instructions

### Step 1: Get Kaggle API Key (2 minutes)

1. **Go to Kaggle**: https://www.kaggle.com/
2. **Sign in** (or create free account - takes 30 seconds)
3. Click your **profile picture** (top right)
4. Click **Settings**
5. Scroll down to **API** section
6. Click **"Create New API Token"**
7. A file called `kaggle.json` will download

### Step 2: Install the API Key (1 minute)

1. Create this folder: `C:\Users\jasmi\.kaggle\`
2. Move the downloaded `kaggle.json` file into that folder
3. Final path should be: `C:\Users\jasmi\.kaggle\kaggle.json`

### Step 3: Download Dataset (10 minutes)

Open PowerShell in Backend folder and run:
```powershell
cd D:\AI_Beauty_consultant\Backend
python collect_kaggle.py
```

This will download **10,000+ professional skin images**!

### Step 4: Organize & Augment (5 minutes)

```powershell
python collect_kaggle.py organize
python generate_dataset.py
```

### Step 5: Train DenseNet (2-4 hours)

```powershell
python train_densenet.py
```

Then wait! Your system will automatically use the new model when done.

---

## Alternative: Manual Collection (If Kaggle Doesn't Work)

If you can't use Kaggle, here's the manual method:

### Create folders:
```powershell
mkdir source_data\acne
mkdir source_data\normal
mkdir source_data\oily
```

### Download images manually:
1. Go to Google Images
2. Search "acne face" - download 30-50 images to `source_data\acne\`
3. Search "normal skin face" - download 30-50 images to `source_data\normal\`
4. Search "oily skin face" - download 30-50 images to `source_data\oily\`

### Then run:
```powershell
python generate_dataset.py
python train_densenet.py
```

---

## Need Help?

If you get stuck, just let me know which step you're on!
