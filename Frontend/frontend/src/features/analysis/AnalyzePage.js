

// import { analyzeImage } from "../../services/api";
// import { useContext, useState } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import ResultCard from "./ResultCard";

// const AnalyzePage = () => {
//   const { token } = useContext(AuthContext);
//   const [image, setImage] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const analyze = async () => {
//     if (!image) return alert("Please select an image");

//     try {
//       setLoading(true);
//       const data = await analyzeImage(image, token);
//       setResult(data);
//     } catch (err) {
//       alert("Analysis failed");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
//       <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-8">
        
//         {/* Header */}
//         <h2 className="text-3xl font-bold text-center mb-2">
//           AI Beauty Analysis
//         </h2>
//         <p className="text-gray-500 text-center mb-6">
//           Upload your face image to get personalized beauty insights
//         </p>

//         {/* Upload */}
//         <div className="flex flex-col items-center gap-4">
//           <input
//             type="file"
//             accept="image/*"
//             onChange={(e) => setImage(e.target.files[0])}
//             className="block w-full text-sm text-gray-600
//               file:mr-4 file:py-2 file:px-4
//               file:rounded-full file:border-0
//               file:text-sm file:font-semibold
//               file:bg-blue-50 file:text-blue-600
//               hover:file:bg-blue-100"
//           />

//           <button
//             onClick={analyze}
//             disabled={loading}
//             className="bg-blue-600 text-white px-6 py-3 rounded-lg
//               hover:bg-blue-700 transition disabled:opacity-50"
//           >
//             {loading ? "Analyzing..." : "Analyze Image"}
//           </button>
//         </div>

//         {/* Result */}
//         {result && (
//           <div className="mt-8">
//             <ResultCard data={result} />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AnalyzePage;
import { analyzeImage } from "../../services/api";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import ResultCard from "./ResultCard";

const AnalyzePage = () => {
  const { token } = useContext(AuthContext);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!image) return alert("Please select an image");

    try {
      setLoading(true);
      const data = await analyzeImage(image, token);
      setResult(data);
    } catch (err) {
      alert("Analysis failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl p-8">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-center mb-2">
          AI Beauty Analysis
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Upload your face image to receive personalized beauty insights
        </p>

        {/* Upload Section */}
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }}
            className="block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-600
              hover:file:bg-blue-100"
          />

          <button
            onClick={analyze}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg
              hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-10">
            <ResultCard data={result} image={preview} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
