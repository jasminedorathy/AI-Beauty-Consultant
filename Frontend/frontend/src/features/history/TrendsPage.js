import React, { useEffect, useState } from 'react';
import { getHistory } from "../../services/api";
import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const TrendsPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrends();
    }, []);

    const fetchTrends = async () => {
        try {
            const res = await getHistory();
            // Reverse to show Oldest -> Newest
            const sorted = res.data.reverse();
            setData(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading trends...</div>;

    if (data.length < 2) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg">
                    <div className="text-6xl mb-4">📈</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Enough Data</h2>
                    <p className="text-gray-500">
                        We need at least 2 analysis records to show your skin progress trends.
                        Scan your face again tomorrow!
                    </p>
                </div>
            </div>
        );
    }

    // Calculate Progress (Last scan vs First scan of the set)
    const latest = data[data.length - 1];
    const previous = data[0]; // Comparison base

    const getChange = (key) => {
        const diff = (latest.skin_scores[key] - previous.skin_scores[key]) * 100;
        return Math.round(diff);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 animate-fade-in-up">
            <div className="max-w-5xl mx-auto">

                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-800">Skin Health Trends</h1>
                    <p className="text-gray-500">Visualizing your skin's improvement over time.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    <KPICard label="Acne Level" value={Math.round(latest.skin_scores.acne * 100)} change={getChange('acne')} inverse={true} />
                    <KPICard label="Oiliness" value={Math.round(latest.skin_scores.oiliness * 100)} change={getChange('oiliness')} inverse={true} />
                    <KPICard label="Texture Roughness" value={Math.round(latest.skin_scores.texture * 100)} change={getChange('texture')} inverse={true} />
                </div>

                {/* Chart Section */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaChartLine className="text-blue-500" /> Progress Chart
                    </h3>

                    <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pb-4 border-b border-gray-100">
                        {data.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end group relative items-center">

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 w-32 text-center pointer-events-none">
                                    <div className="font-bold">{item.date}</div>
                                    <div>Acne: {Math.round(item.skin_scores.acne * 100)}%</div>
                                </div>

                                {/* Bar Group */}
                                <div className="w-full flex justify-center gap-1 h-full items-end max-w-[40px]">
                                    {/* Acne Bar (Red) */}
                                    <div
                                        style={{ height: `${item.skin_scores.acne * 100}%` }}
                                        className="w-1/3 bg-red-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                                    ></div>
                                    {/* Oil Bar (Yellow) */}
                                    <div
                                        style={{ height: `${item.skin_scores.oiliness * 100}%` }}
                                        className="w-1/3 bg-yellow-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                                    ></div>
                                    {/* Texture Bar (Blue) */}
                                    <div
                                        style={{ height: `${item.skin_scores.texture * 100}%` }}
                                        className="w-1/3 bg-blue-400 rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                                    ></div>
                                </div>

                                {/* Date Label */}
                                <div className="text-[10px] text-gray-400 mt-2 truncate w-full text-center">
                                    {item.date.split('-').slice(1).join('/')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-3 h-3 bg-red-400 rounded-full"></div> Acne
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Oiliness
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div> Texture
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const KPICard = ({ label, value, change, inverse }) => {
    // Inverse: Lower is better (e.g. Acne). Standard: Higher is better.
    const isGood = inverse ? change <= 0 : change >= 0;
    const color = isGood ? "text-green-500" : "text-red-500";
    const Icon = change >= 0 ? FaArrowUp : FaArrowDown;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</div>
            <div className="flex items-end gap-3">
                <div className="text-4xl font-extrabold text-gray-800">{value}%</div>
                <div className={`flex items-center text-sm font-bold mb-1 ${color}`}>
                    <Icon size={10} className="mr-1" />
                    {Math.abs(change)}%
                </div>
            </div>
        </div>
    );
};

export default TrendsPage;
