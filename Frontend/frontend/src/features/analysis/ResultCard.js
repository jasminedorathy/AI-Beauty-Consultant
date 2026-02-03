import React from 'react';

const ResultCard = ({ data, image, annotatedImage }) => {
  const [showAnnotated, setShowAnnotated] = React.useState(true);

  if (!data) return null;

  const { faceShape, skinScores, recommendations, personalizedTips, error, colorAnalysis, gender } = data;

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
    if (value > 0.7) return "text-red-600";
    if (value > 0.4) return "text-amber-600";
    return "text-emerald-600";
  };

  const getProgressColor = (value) => {
    if (value > 0.7) return "bg-gradient-to-r from-red-500 to-red-600";
    if (value > 0.4) return "bg-gradient-to-r from-amber-500 to-amber-600";
    return "bg-gradient-to-r from-emerald-500 to-emerald-600";
  };

  const getScoreBadge = (value) => {
    if (value > 0.7) return { text: "High", color: "bg-red-100 text-red-700 border-red-300" };
    if (value > 0.4) return { text: "Moderate", color: "bg-amber-100 text-amber-700 border-amber-300" };
    return { text: "Low", color: "bg-emerald-100 text-emerald-700 border-emerald-300" };
  };

  return (
    <div className="max-w-7xl mx-auto mt-12 animate-fade-in-up">

      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-teal-600 rounded-t-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {gender === "Male" ? "Gentleman's Analysis" : "Beauty Analysis"} Report
            </h2>
            <p className="text-purple-100">Comprehensive AI-Powered Facial Assessment</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl">
            <div className="text-sm text-purple-100 mb-1">Face Shape</div>
            <div className="text-2xl font-bold">{faceShape}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="bg-white rounded-b-3xl shadow-2xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Image & Color Analysis */}
          <div className="space-y-6">

            {/* Image Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Diagnostic View</h3>
                {annotatedImage && (
                  <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
                    <button
                      onClick={() => setShowAnnotated(false)}
                      className={`px-4 py-2 rounded-l-lg text-sm font-medium transition-all ${!showAnnotated ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Original
                    </button>
                    <button
                      onClick={() => setShowAnnotated(true)}
                      className={`px-4 py-2 rounded-r-lg text-sm font-medium transition-all ${showAnnotated ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      AI View
                    </button>
                  </div>
                )}
              </div>

              <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-lg">
                <img
                  src={showAnnotated && annotatedImage ? annotatedImage : image}
                  alt="Analyzed Face"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Color Analysis Card */}
            {colorAnalysis && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🎨</span> Color Analysis
                </h3>
                <div className="space-y-3">
                  {colorAnalysis.skin_tone && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Skin Tone</span>
                      <span className="font-semibold text-gray-800">{colorAnalysis.skin_tone}</span>
                    </div>
                  )}
                  {colorAnalysis.undertone && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Undertone</span>
                      <span className="font-semibold text-gray-800 capitalize">{colorAnalysis.undertone}</span>
                    </div>
                  )}
                  {colorAnalysis.eye_color && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Eye Color</span>
                      <span className="font-semibold text-gray-800">{colorAnalysis.eye_color}</span>
                    </div>
                  )}
                  {colorAnalysis.hair_color && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Hair Color</span>
                      <span className="font-semibold text-gray-800">{colorAnalysis.hair_color}</span>
                    </div>
                  )}
                  {colorAnalysis.season && (
                    <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Seasonal Palette</span>
                      <span className="font-semibold text-purple-600">{colorAnalysis.season}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Skin Analysis & Recommendations */}
          <div className="space-y-6">

            {/* Skin Health Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                <span className="mr-2">📊</span> Skin Health Metrics
              </h3>

              <div className="space-y-5">
                {skinScores && Object.keys(skinScores).length > 0 ? (
                  Object.entries(skinScores).map(([key, value]) => {
                    const badge = getScoreBadge(value);
                    return (
                      <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {key === "acne" ? "🔴" : key === "oiliness" ? "✨" : "🧱"}
                            </span>
                            <div>
                              <div className="font-bold text-gray-800 capitalize text-sm">{key}</div>
                              <div className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-block mt-1 ${badge.color}`}>
                                {badge.text}
                              </div>
                            </div>
                          </div>
                          <div className={`text-3xl font-black ${getScoreColor(value)}`}>
                            {Math.round(value * 100)}
                            <span className="text-sm text-gray-400 ml-1">%</span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(value)} shadow-lg`}
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No skin analysis data available</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                <span className="mr-2">✨</span> Personalized Routine
              </h3>

              <div className="space-y-3">
                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec, i) => {
                    let icon = "✨";
                    if (rec.toLowerCase().includes("cleanser") || rec.toLowerCase().includes("wash")) icon = "🧴";
                    else if (rec.toLowerCase().includes("sunscreen") || rec.toLowerCase().includes("spf")) icon = "☀️";
                    else if (rec.toLowerCase().includes("moisturizer") || rec.toLowerCase().includes("hydrate")) icon = "💧";
                    else if (rec.toLowerCase().includes("exfoliate") || rec.toLowerCase().includes("scrub")) icon = "🧼";
                    else if (rec.toLowerCase().includes("serum")) icon = "🧪";
                    else if (rec.toLowerCase().includes("mask")) icon = "🧖‍♀️";

                    const formatRec = (text) => {
                      const parts = text.split(/(\*\*.*?\*\*)/g);
                      return parts.map((part, index) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={index} className="text-indigo-900">{part.slice(2, -2)}</strong>
                          : part
                      );
                    };

                    return (
                      <div
                        key={i}
                        className="flex items-start bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                      >
                        <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xl mr-3 shadow-sm">
                          {icon}
                        </span>
                        <span className="text-gray-700 font-medium leading-relaxed text-sm pt-2">
                          {formatRec(rec)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No recommendations available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Tips Section - Full Width */}
        {personalizedTips && personalizedTips.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
              <span className="mr-2">💡</span> Your Personalized Beauty Tips
              <span className="ml-3 text-xs font-normal bg-purple-100 text-purple-700 px-3 py-1 rounded-full">AI-Generated Just For You</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalizedTips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md hover:border-purple-300 transition-all duration-200"
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl mr-3 shadow-sm">
                    {tip.match(/^[\u{1F300}-\u{1F9FF}]/u)?.[0] || "✨"}
                  </span>
                  <span className="text-gray-700 font-medium leading-relaxed text-sm pt-2">
                    {tip.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
