# AI Beauty Consultant 💄✨

AI-powered beauty analysis platform with skin analysis, personalized recommendations, and styling features.

## 🎨 Features

- **Face Analysis**: Upload photos for instant skin analysis
- **Live Camera**: Real-time face analysis with webcam
- **Hair Styling**: Personalized hairstyle recommendations
- **Nail Studio**: Curated nail art designs
- **Skin Health Dashboard**: Track hydration, sun protection, and texture
- **Personalized Tips**: AI-driven beauty recommendations

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

### Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend/frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

The backend will run on `http://localhost:5000`

## 📁 Project Structure

```
AI-Beauty-Consultant/
├── Frontend/
│   └── frontend/
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── features/       # Feature modules
│       │   ├── layout/         # Layout components
│       │   ├── pages/          # Page components
│       │   └── index.css       # Global styles
│       ├── public/             # Static assets
│       └── package.json        # Dependencies
│
├── Backend/
│   ├── app/
│   │   ├── api/               # API routes
│   │   └── models/            # ML models (not in repo)
│   ├── requirements.txt       # Python dependencies
│   └── *.py                   # Python scripts
│
└── .gitignore                 # Excluded files
```

## ⚠️ Important Notes

### Missing Files (Excluded from Git)

The following files are **NOT** included in the repository due to size:

1. **`node_modules/`** - Install with `npm install`
2. **`venv/`** - Create with `python -m venv venv`
3. **Dataset files** (`.csv`, `.zip`, images)
4. **Model files** (`.h5`, `.pkl`, `.pth`)

### To Get the Project Fully Working:

1. **Install Dependencies** (see Quick Start above)
2. **Add Dataset Files** (if needed for training):
   - Place datasets in `Backend/datasets/`
   - See `Backend/COLLECTION_GUIDE.md` for dataset collection instructions
3. **Add Model Files** (if needed):
   - Place trained models in `Backend/models/`
   - Or train new models using provided scripts

## 🎨 UI Theme

- **Primary Color**: Purple (#a855f7)
- **Accent Color**: Teal (#14b8a6)
- **Design**: Modern glassmorphism with smooth animations

## 📚 Documentation

- **`Backend/SIMPLE_METHOD.md`** - Simple dataset collection method
- **`Backend/COLLECTION_GUIDE.md`** - Comprehensive dataset guide
- **`Backend/QUICK_START.md`** - Backend quick start guide

## 🛠️ Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- React Icons

### Backend
- Python Flask
- TensorFlow/PyTorch (for ML models)
- OpenCV
- NumPy

## 📝 Environment Variables

Create a `.env` file in the Frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Create a `.env` file in the Backend directory:

```env
FLASK_ENV=development
FLASK_APP=app.py
```

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Push and create a pull request

## 📄 License

This project is for educational purposes.

## 👥 Authors

- Jasmine Dorathy

---

**Need Help?** Check the documentation files in the `Backend/` directory or create an issue on GitHub.
