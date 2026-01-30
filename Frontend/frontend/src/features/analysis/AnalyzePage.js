import { useState, useContext } from "react";
import { analyzeImage } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import ResultCard from "./ResultCard";
import Loader from "../../components/Loader";
import ErrorMessage from "../../components/ErrorMessage";
import DemoModal from "../../components/DemoModal";
import { getDemoResultById } from "../../data/demoData";

const AnalyzePage = () => {
  const { token, logout } = useContext(AuthContext); // Destructure logout

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const analyze = async () => {
    if (!image) return alert("Please select an image first.");

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      setResult(null); // Clear previous results

      const res = await analyzeImage(formData);
      console.log("Analysis Result:", res);

      // Handle new API response structure: {success: true, data: {...}}
      let analysisData = res;

      // If response has a 'data' wrapper, extract it
      if (res.success && res.data) {
        analysisData = {
          faceShape: res.data.face_shape,
          faceShapeConfidence: res.data.confidence,
          gender: res.data.gender,
          skinScores: res.data.skin_analysis || {},
          colorAnalysis: res.data.color_analysis || {},
          recommendations: res.data.recommendations || [],
          imageUrl: res.data.image_url,
          annotatedImageUrl: res.data.annotated_image_url
        };
      }

      // Set successful result
      setResult(analysisData);

    } catch (e) {
      console.error(e);

      // Auto-logout if session expired
      if (e.response && e.response.status === 401) {
        logout();
        return; // Redirect happens automatically via ProtectedRoute
      }

      // Extract error message
      let errorMsg = e.response?.data?.error || e.response?.data?.detail || e.message || "Analysis failed. Please try again.";

      if (typeof errorMsg === 'object') {
        errorMsg = JSON.stringify(errorMsg);
      }

      // Set error state (will be displayed by ErrorMessage component)
      setError(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  // Handle Demo Selection
  const handleDemoSelect = (demoId) => {
    const demoData = getDemoResultById(demoId);
    if (demoData) {
      setPreview(demoData.imageUrl);
      setResult(demoData.result);
      setIsDemo(true);
      setError(null);
      setImage(null); // Clear actual image since this is demo
    }
  };

  // Determine Theme based on Gender
  const isMale = result?.gender === "Male";
  const theme = isMale
    ? {
      bg: "from-slate-800 to-blue-900",
      text: "from-blue-400 to-teal-400",
      button: "from-blue-600 to-teal-600",
      badge: "bg-blue-100 text-blue-800"
    }
    : {
      bg: "from-purple-600 to-teal-600", // Header Text Gradient
      text: "from-purple-600 to-teal-600",
      button: "from-purple-600 to-teal-600",
      badge: "bg-teal-100 text-teal-800"
    };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.text} mb-2`}>
          {isMale ? "Gentlemen's Skin Analysis" : "AI Beauty Analysis"}
        </h2>
        <p className="text-gray-500 text-lg">
          {isMale
            ? "Advanced grooming insights tailored for men."
            : "Upload a clear photo to reveal your personalized skin insights."}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-5xl">

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center transition-all duration-300 hover:shadow-2xl">

          <div className="mb-6 flex justify-center">
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="preview"
                  className="h-64 object-cover rounded-2xl shadow-md"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <span className="text-white font-medium">Change Image</span>
                </div>
                {/* Gender Badge Overlay */}
                {result?.gender && (
                  <div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide ${theme.badge}`}>
                    {result.gender}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or WEBP</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <button
            onClick={analyze}
            disabled={loading || !image}
            className={`w-full max-w-xs py-3.5 px-6 rounded-xl font-bold text-white text-lg tracking-wide shadow-lg transform transition-all duration-200
                    ${loading || !image
                ? 'bg-gray-400 cursor-not-allowed'
                : `bg-gradient-to-r ${theme.button} hover:scale-105 hover:shadow-xl`
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : "Analyze Face"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Try Demo Button */}
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="w-full max-w-xs py-3.5 px-6 rounded-xl font-bold text-purple-600 border-2 border-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Try Sample Analysis
          </button>
        </div>

        {/* Demo Badge on Result */}
        {isDemo && result && (
          <div className="bg-gradient-to-r from-purple-100 to-teal-100 border-l-4 border-purple-600 p-4 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-bold text-purple-900">Demo Mode Active</p>
              <p className="text-sm text-purple-800">This is a sample analysis. <a href="/signup" className="underline font-semibold">Sign up</a> to analyze your own photos!</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <Loader variant="ai-analysis" message="Analyzing your beautiful features..." />
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-8">
            <ErrorMessage
              type="error"
              message={error}
              technicalDetails={error}
              showDetails={true}
              onRetry={analyze}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Result Section */}
        {result && !loading && !error && (
          <div className="animate-fade-in-up">
            <ResultCard
              data={{
                ...result,
                faceShape: result.face_shape || result.faceShape,
                skinScores: result.skin_scores || result.skinScores || result.skin_analysis || result.skinAnalysis
              }}
              image={preview}
              annotatedImage={result.annotated_image_url}
              gender={result.gender}
            />
          </div>
        )}
      </div>

      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectDemo={handleDemoSelect}
      />
    </div>
  );
};

export default AnalyzePage;
