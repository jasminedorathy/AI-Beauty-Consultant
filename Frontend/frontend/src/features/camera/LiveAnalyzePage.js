import { useEffect, useRef, useState, useContext } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { AuthContext } from "../../context/AuthContext";
import { analyzeImage } from "../../services/api";
import ResultCard from "../analysis/ResultCard";

const LiveAnalyzePage = () => {
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const { token } = useContext(AuthContext);

  const [faces, setFaces] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream = null;
    let animationId = null;

    const setupLiveAnalysis = async () => {
      try {
        // 1. Load MediaPipe FaceLandmarker
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1
        });

        console.log("✅ FaceLandmarker loaded");

        // 2. Start Camera
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }

      } catch (err) {
        console.error("Setup error:", err);
        setError("Failed to initialize camera or AI model.");
      }
    };

    let lastVideoTime = -1;
    function predictWebcam() {
      if (
        landmarkerRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        let startTimeMs = performance.now();
        if (videoRef.current.currentTime !== lastVideoTime) {
          lastVideoTime = videoRef.current.currentTime;
          const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

          // Update detections
          if (results.faceLandmarks) {
            const count = results.faceLandmarks.length;
            if (count !== faces) setFaces(count);
          }
        }
      }
      animationId = requestAnimationFrame(predictWebcam);
    }

    setupLiveAnalysis();

    return () => {
      cancelAnimationFrame(animationId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (landmarkerRef.current) landmarkerRef.current.close();
    };
  }, []); // eslint-disable-next-line

  const captureAndAnalyze = async () => {
    if (!videoRef.current || faces === 0) {
      if (faces === 0) setError("No face detected. Please position yourself in the frame.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    // Create a blob for upload
    const blob = await new Promise((res) =>
      canvas.toBlob(res, "image/jpeg")
    );

    // Create a URL for preview
    const previewUrl = URL.createObjectURL(blob);
    setCapturedImage(previewUrl);

    const formData = new FormData();
    formData.append("image", blob, "live.jpg");

    try {
      const res = await analyzeImage(formData);

      if (res.error) {
        setError(res.error);
        setResult(null);
      } else {
        setResult(res);
      }
    } catch (e) {
      console.error(e);
      const serverError = e.response?.data?.error || e.response?.data?.detail || "Analysis failed. Please try again.";
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setCapturedImage(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
          Live Face Analysis
        </h2>
        <p className="text-gray-500">Real-time detection and instant skin analysis.</p>
      </div>

      <div className="w-full max-w-4xl">

        {/* Camera/Error Section */}
        {!result && (
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 flex flex-col items-center relative">
            {error && (
              <div className="absolute top-4 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold z-10 w-full max-w-md text-center shadow-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="relative rounded-2xl overflow-hidden shadow-md bg-gray-900 w-full max-w-[640px] aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
              />

              {/* Face Detection Indicator */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-colors duration-300
                        ${faces > 0 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}
                    `}>
                {faces > 0 ? "Face Detected" : "No Face"}
              </div>
            </div>

            <button
              onClick={captureAndAnalyze}
              disabled={loading || faces === 0}
              className={`mt-6 w-full max-w-xs py-3.5 px-6 rounded-xl font-bold text-white text-lg tracking-wide shadow-lg transform transition-all duration-200
                        ${loading || faces === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105 hover:shadow-xl'
                }`}
            >
              {loading ? "Processing..." : "Capture & Analyze"}
            </button>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="animate-fade-in-up">
            <button
              onClick={reset}
              className="mb-4 text-blue-600 font-semibold hover:underline flex items-center transition-colors hover:text-blue-800"
            >
              ← Back to Camera
            </button>
            <ResultCard
              data={{
                ...result,
                faceShape: result.face_shape || result.faceShape,
                skinScores: result.skin_scores || result.skinScores || result.skin_analysis || result.skinAnalysis
              }}
              image={capturedImage}
              annotatedImage={result.annotated_image_url}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAnalyzePage;
