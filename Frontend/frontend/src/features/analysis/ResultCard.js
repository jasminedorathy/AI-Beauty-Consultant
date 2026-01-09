



// const ResultCard = ({ data }) => {
//   const { faceShape, skinScores, recommendations } = data;

//   return (
//     <div className="mt-8 bg-white shadow-xl rounded-2xl p-6 max-w-2xl mx-auto">
      
//       {/* Face Shape */}
//       <div className="flex items-center justify-between mb-6">
//         <h3 className="text-xl font-semibold text-gray-800">
//           Face Shape Analysis
//         </h3>
//         <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
//           {faceShape}
//         </span>
//       </div>

//       {/* Skin Scores */}
//       <h4 className="text-lg font-semibold text-gray-700 mb-4">
//         Skin Condition Scores
//       </h4>

//       <div className="space-y-4">
//         {Object.entries(skinScores).map(([key, value]) => (
//           <div key={key}>
//             <div className="flex justify-between text-sm mb-1">
//               <span className="capitalize text-gray-600">{key}</span>
//               <span className="text-gray-700 font-medium">
//                 {(value * 100).toFixed(0)}%
//               </span>
//             </div>

//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
//                 style={{ width: `${value * 100}%` }}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Recommendations */}
//       <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-3">
//         Personalized Recommendations
//       </h4>

//       <ul className="list-disc list-inside text-gray-600 space-y-2">
//         {recommendations.map((rec, index) => (
//           <li key={index}>{rec}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ResultCard;




const ResultCard = ({ data, image }) => {
  const { faceShape, skinScores, recommendations } = data;

  return (
    <div className="mt-10 bg-white shadow-2xl rounded-3xl p-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Your AI Beauty Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* LEFT: Uploaded Image */}
        <div className="flex flex-col items-center">
          <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-lg border">
            <img
              src={image}
              alt="Uploaded Face"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Uploaded Image
          </p>
        </div>

        {/* RIGHT: Analysis */}
        <div>
          
          {/* Face Shape */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Face Shape
            </h3>
            <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
              {faceShape}
            </span>
          </div>

          {/* Skin Scores */}
          <h4 className="text-lg font-semibold text-gray-700 mb-4">
            Skin Condition Scores
          </h4>

          <div className="space-y-4">
            {Object.entries(skinScores).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-600">
                    {key}
                  </span>
                  <span className="font-medium text-gray-800">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <h4 className="text-lg font-semibold text-gray-700 mt-8 mb-3">
            Personalized Recommendations
          </h4>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
