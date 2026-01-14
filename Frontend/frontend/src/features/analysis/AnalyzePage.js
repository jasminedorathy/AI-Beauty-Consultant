import { useState, useContext } from "react";
import { analyzeImage } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import ResultCard from "./ResultCard";

const AnalyzePage = () => {
  const { token, logout } = useContext(AuthContext); // Destructure logout

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const res = await analyzeImage(formData);
      console.log("Analysis Result:", res);

      // Always display result, even if it contains an error (ResultCard handles it)
      setResult(res);

    } catch (e) {
      console.error(e);
      // Auto-logout if session expired
      if (e.response && e.response.status === 401) {
        logout();
        return; // Redirect happens automatically via ProtectedRoute
      }

      // Check if server returned a structured error
      let serverError = e.response?.data?.error || e.response?.data?.detail || "Analysis failed. Please check the backend logs.";

      if (typeof serverError === 'object') {
        serverError = JSON.stringify(serverError);
      }

      // For network/server crashes, we create a synthetic result object to display the error in the card
      setResult({ error: serverError, skinScores: {}, recommendations: [], faceShape: "N/A" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          AI Beauty Analysis
        </h2>
        <p className="text-gray-500 text-lg">Upload a clear photo to reveal your personalized skin insights.</p>
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
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-xl'
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
        </div>

        {/* Result Section */}
        {result && (
          <div className="animate-fade-in-up">
            <ResultCard
              data={{
                ...result,
                faceShape: result.face_shape || result.faceShape,
                skinScores: result.skin_scores || result.skinScores || result.skin_analysis || result.skinAnalysis
              }}
              image={preview}
              annotatedImage={result.annotated_image_url}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;


// import { useContext, useState } from "react";
// import { analyzeImage } from "../../services/api";
// import { AuthContext } from "../../context/AuthContext";
// import ResultCard from "./ResultCard";

// const AnalyzePage = () => {
//   const { token } = useContext(AuthContext);

//   const [image, setImage] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   // Handle image selection
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setImage(file);
//     setPreviewUrl(URL.createObjectURL(file));
//     setResult(null); // reset old results
//   };

//   // Call backend
//   // const analyze = async () => {
//   //   if (!image) {
//   //     alert("Please select an image");
//   //     return;
//   //   }

//   //   try {
//   //     setLoading(true);
//   //     const data = await analyzeImage(image, token);
//   //     setResult(data);
//   //   } catch (error) {
//   //     console.error(error);
//   //     alert("Analysis failed");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// const analyze = async () => {
//   const data = await analyzeImage(image, token);
//   setResult(data);
// };

//   return (
//     <div className="min-h-screen bg-gray-100 flex justify-center p-6">
//       <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl p-8">

//         {/* Header */}
//         <h2 className="text-3xl font-bold text-center mb-2">
//           AI Beauty Analysis
//         </h2>
//         <p className="text-gray-500 text-center mb-8">
//           Upload a clear face image to preview and analyze
//         </p>

//         {/* Upload + Preview */}
//         <div className="flex flex-col items-center gap-4 mb-10">
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//           />

//           {previewUrl && (
//             <div className="w-full max-w-md h-64 border rounded-xl bg-gray-50 flex items-center justify-center">
//               <img
//                 src={previewUrl}
//                 alt="Selected preview"
//                 className="w-full h-full object-contain rounded-xl"
//               />
//             </div>
//           )}

//           <button
//             onClick={analyze}
//             disabled={loading}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//           >
//             {loading ? "Analyzing..." : "Analyze Image"}
//           </button>
//         </div>

//         {/* Results Section */}
//         {result && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

//             {/* Uploaded Face */}
//             <div className="bg-white rounded-xl shadow p-6">
//               <h3 className="font-semibold mb-4">Uploaded Face</h3>

//               <div className="w-full h-64 border rounded-lg bg-gray-50 flex items-center justify-center">
//                 <img
//                   src={previewUrl}
//                   alt="Uploaded face"
//                   className="w-full h-full object-contain rounded-lg"
//                 />
//               </div>
//             </div>

//             {/* Analysis Result */}
//             <ResultCard data={result} />

//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default AnalyzePage;
