import React, { useState, useEffect } from 'react';
import { getHistory } from '../../services/api';
import { FaSpinner, FaHistory } from 'react-icons/fa';

const NAIL_TRENDS = {
    Light: [
        { name: "Soft Pastels", tags: ["Daily", "Work"], colors: ["#FBCFE8", "#E9D5FF", "#BAE6FD"], desc: "Delicate shades like lavender and baby blue complement cool undertones.", img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80" },
        { name: "Classic Red", tags: ["Party", "Work"], colors: ["#EF4444"], desc: "A blue-based red pops beautifully against fair skin.", img: "https://images.unsplash.com/photo-1632924541498-881a38f31e3d?auto=format&fit=crop&w=600&q=80" }
    ],
    Medium: [
        { name: "Warm Nudes", tags: ["Daily", "Work"], colors: ["#D6BCFA", "#FDE047", "#FDBA74"], desc: "Beiges and tans with warmer undertones look seamless and chic.", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80" },
        { name: "Metallic Gold", tags: ["Party"], colors: ["#EAB308"], desc: "Gold and coppers bring out the warmth in medium skin.", img: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&w=600&q=80" }
    ],
    Dark: [
        { name: "Neon Pops", tags: ["Party", "Daily"], colors: ["#22C55E", "#F472B6", "#3B82F6"], desc: "High-contrast neons look absolutely stunning and vibrant.", img: "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=600&q=80" },
        { name: "Deep Jewel Tones", tags: ["Party", "Work"], colors: ["#1E3A8A", "#581C87", "#064E3B"], desc: "Emeralds, sapphires, and deep purples look regal and elegant.", img: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=600&q=80" }
    ]
};

const NailStyling = () => {
    const [skinTone, setSkinTone] = useState("Medium");
    const [occasion, setOccasion] = useState("Daily");
    const [loading, setLoading] = useState(true);
    const [hasAnalysis, setHasAnalysis] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistory();
                if (history && history.length > 0) {
                    const latest = history[0];
                    if (latest.skin_tone) {
                        // Map backend skin tone to "Light", "Medium", "Dark"
                        const toneMap = {
                            "Fair": "Light",
                            "Light": "Light",
                            "Medium": "Medium",
                            "Tan": "Medium",
                            "Brown": "Dark",
                            "Dark": "Dark",
                            "Deep": "Dark"
                        };
                        setSkinTone(toneMap[latest.skin_tone] || "Medium");
                        setHasAnalysis(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Filter Logic
    const currentTrends = NAIL_TRENDS[skinTone].filter(t =>
        occasion === "All" || t.tags.includes(occasion)
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 animate-fade-in-up">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-purple-600 mb-2">Nail Art Studio 💅</h1>
                    <p className="text-gray-500 text-lg">Curated palettes and designs for your hands.</p>

                    {hasAnalysis && (
                        <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                            <FaHistory /> Auto-Customized based on your last analysis
                        </div>
                    )}
                </div>

                {/* Controls Section */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-12">
                    <div className="flex flex-col md:flex-row gap-8 justify-center items-center">

                        {/* Skin Tone Selector */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Skin Tone:</span>
                            <div className="flex gap-3">
                                {["Light", "Medium", "Dark"].map(tone => (
                                    <button key={tone} onClick={() => setSkinTone(tone)} className={`flex flex-col items-center gap-1 group`}>
                                        <div className={`w-8 h-8 rounded-full border-2 transition-all ${skinTone === tone ? "border-teal-500 scale-125" : "border-transparent opacity-50 hover:opacity-100"}`}
                                            style={{ backgroundColor: tone === "Light" ? "#F3E5DC" : tone === "Medium" ? "#EAC096" : "#8D5524" }}>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                        {/* Occasion Filter */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Occasion:</span>
                            <div className="flex gap-2">
                                {["Daily", "Party", "Work"].map(occ => (
                                    <button
                                        key={occ}
                                        onClick={() => setOccasion(occ)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${occasion === occ ? "bg-teal-100 text-teal-700 shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                                    >
                                        {occ}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {currentTrends.length > 0 ? currentTrends.map((trend, idx) => (
                        <div key={idx} className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row group border border-gray-100">
                            <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden relative">
                                <img
                                    src={trend.img}
                                    alt={trend.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3 flex gap-1">
                                    {trend.tags.map(tag => (
                                        <span key={tag} className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8 w-full md:w-1/2 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{trend.name}</h3>
                                <p className="text-gray-500 mb-6 text-sm leading-relaxed">{trend.desc}</p>

                                <div className="flex gap-2">
                                    {trend.colors.map(c => (
                                        <div key={c} className="w-8 h-8 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-110" style={{ backgroundColor: c }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-10 text-gray-400">
                            No specific trends found for this combination. Try another filter!
                        </div>
                    )}
                </div>

                {/* Nail Shape Guide */}
                <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">💅 Nail Shape Guide</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                            { name: "Almond", desc: "Elongates fingers", icon: "https://images.unsplash.com/photo-1629813291244-a034293f0b24?auto=format&fit=crop&w=400&q=80" },
                            { name: "Coffin", desc: "Trendy & Edgy", icon: "https://images.unsplash.com/photo-1600069327891-9dc55146c8e3?auto=format&fit=crop&w=400&q=80" },
                            { name: "Square", desc: "Classic & Strong", icon: "https://images.unsplash.com/photo-1599695669168-9a88880a4005?auto=format&fit=crop&w=400&q=80" },
                            { name: "Stiletto", desc: "Bold & Dramatic", icon: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&w=400&q=80" },
                            { name: "Oval", desc: "Natural Look", icon: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=400&q=80" }
                        ].map((shape, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 p-4 hover:bg-teal-50 rounded-2xl transition-colors cursor-pointer group">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden border-2 border-white">
                                    <img src={shape.icon} alt={shape.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{shape.name}</div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400">{shape.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default NailStyling;
