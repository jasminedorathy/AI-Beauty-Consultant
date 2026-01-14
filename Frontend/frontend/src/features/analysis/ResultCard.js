
// const ResultCard = ({ data, image }) => {
//   if (!data) {
//     return <div className="bg-white rounded-xl shadow p-6">No analysis data available.</div>;
//   }

//   const { faceShape, skinScores, recommendations } = data;

//   return (
//     <div className="bg-white rounded-xl shadow p-6">
//       <h3 className="text-xl font-semibold mb-4">
//         Face Shape: <span className="text-blue-600">{faceShape || 'N/A'}</span>
//       </h3>

//       <h4 className="font-semibold mb-3">Skin Scores</h4>
//       {skinScores && typeof skinScores === 'object' ? (
//         Object.entries(skinScores).map(([key, value]) => (
//           <div key={key} className="mb-3">
//             <div className="flex justify-between text-sm">
//               <span className="capitalize">{key}</span>
//               <span>{Math.round(value * 100)}%</span>
//             </div>
//             <div className="h-2 bg-gray-200 rounded">
//               <div
//                 className="h-2 bg-blue-600 rounded"
//                 style={{ width: `${value * 100}%` }}
//               />
//             </div>
//           </div>
//         ))
//       ) : (
//         <p>No skin scores available.</p>
//       )}

//       <h4 className="font-semibold mt-6 mb-2">Recommendations</h4>
//       {recommendations && Array.isArray(recommendations) ? (
//         <ul className="list-disc list-inside text-gray-600">
//           {recommendations.map((rec, i) => (
//             <li key={i}>{rec}</li>
//           ))}
//         </ul>
//       ) : (
//         <p>No recommendations available.</p>
//       )}
//     </div>
//   );
// };

// export default ResultCard;
import React from 'react';

const ResultCard = ({ data, image, annotatedImage }) => {
  const [showAnnotated, setShowAnnotated] = React.useState(true);

  if (!data) return null; // Should not happen if parent handles it, but safe check

  const { faceShape, skinScores, recommendations, error } = data;

  if (error) {
    return (
      <div className="mt-8 animate-fade-in-up">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg relative flex items-center">
          <div className="mr-4 text-2xl">⚠️</div>
          <div>
            <strong className="font-bold text-lg mb-1 block">Analysis Could Not Complete</strong>
            <span className="block">{error.replace(/"/g, '')}</span>
          </div>
        </div>
      </div>
    )
  }

  // Helper for score color
  const getScoreColor = (value) => {
    if (value > 0.7) return "text-red-500";
    if (value > 0.4) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressColor = (value) => {
    if (value > 0.7) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (value > 0.4) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12 animate-fade-in-up">

      {/* Image Section - Interactive Card */}
      <div className="group relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 hover:shadow-purple-500/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-3xl -z-10"></div>

        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {showAnnotated ? "AI Diagnostic View" : "Original Image"}
            </span>
          </h4>

          {annotatedImage && (
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setShowAnnotated(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${!showAnnotated ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Original
              </button>
              <button
                onClick={() => setShowAnnotated(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${showAnnotated ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                AI View
              </button>
            </div>
          )}
        </div>

        <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-white/60 shadow-inner bg-gray-50 group-hover:scale-[1.02] transition-transform duration-300">
          <img
            src={showAnnotated && annotatedImage ? annotatedImage : image}
            alt="Analyzed Face"
            className="w-full h-full object-contain"
          />
          {/* Face Shape Badge Overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-purple-100">
            <span className="text-sm text-gray-500 mr-2 uppercase tracking-wider font-semibold">Shape</span>
            <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {faceShape}
            </span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-8">

        {/* Skin Scores Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg>
          </div>

          <h4 className="text-xl font-bold text-gray-800 mb-6">Skin Health Analysis</h4>
          <div className="space-y-6 relative z-10">
            {Object.entries(skinScores).map(([key, value]) => (
              <div key={key} className="group">
                <div className="flex justify-between mb-2 items-end">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{key}</span>
                  <span className={`text-lg font-black ${getScoreColor(value)}`}>
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${getProgressColor(value)}`}
                    style={{ width: `${value * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-xl border border-indigo-100">
          <h4 className="text-xl font-bold text-indigo-900 mb-6 flex items-center">
            <span className="mr-2 text-2xl">✨</span> Personalized Routine
          </h4>
          <ul className="space-y-4">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start bg-white/80 p-4 rounded-xl shadow-sm border border-indigo-50/50 hover:shadow-md transition-shadow">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 text-xs font-bold mr-3 mt-0.5 shrink-0 shadow-sm">✓</span>
                <span className="text-gray-700 font-medium leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ResultCard;
