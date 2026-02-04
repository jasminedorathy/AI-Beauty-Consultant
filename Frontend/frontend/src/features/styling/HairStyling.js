import { useEffect, useState } from "react";
import { getHistory } from "../../services/api";
import { FaCut, FaPalette, FaHistory, FaInfoCircle, FaStar, FaShapes, FaMagic, FaCheckCircle, FaChevronRight } from 'react-icons/fa';

/**
 * PREMIUM HAIR RECOMMENDATION ENGINE
 * Curated high-definition assets for specific face shapes.
 */
const HAIR_ASSETS = {
    Oval: {
        Male: [
            { style: "Modern Pompadour", desc: "Adds vertical height to perfectly balance your symmetric oval profile.", img: "/images/hairstyles/men_oval_quiff.png" },
            { style: "Textured Quiff", desc: "A versatile, effortless look that maintains natural facial balance.", img: "/images/hairstyles/men_oval_quiff.png" },
            { style: "Side Swept Undercut", desc: "Sharp contrast that highlights your strong cheekbone structure.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
            { style: "Classic Slick Back", desc: "Sophisticated and sharp, mirroring your balanced proportions.", img: "https://images.unsplash.com/photo-1521146764736-56c929d59c83?auto=format&fit=crop&w=800&q=80" },
            { style: "Mid Fade Fringe", desc: "Softens the forehead while maintaining the oval's natural symmetry.", img: "https://images.unsplash.com/photo-1593702295094-ada75ec38835?auto=format&fit=crop&w=800&q=80" },
            { style: "Man Bun", desc: "A bold choice that showcases your balanced facial proportions.", img: "https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=crop&w=800&q=80" }
        ],
        Female: [
            { style: "Long Silk Layers", desc: "Adds movement without hiding your ideal face shape symmetry.", img: "https://images.unsplash.com/photo-1492106087820-71f1717878e2?auto=format&fit=crop&w=800&q=80" },
            { style: "Blunt Glass Bob", desc: "A clean, chin-length cut that emphasizes your elegant jawline.", img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80" },
            { style: "Curtain Shag", desc: "Softly frames the face, creating a youthful and balanced appearance.", img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80" },
            { style: "Boho Waves", desc: "Gentle volume that complements the smooth curves of your profile.", img: "https://images.unsplash.com/photo-1635273051937-6030999086e3?auto=format&fit=crop&w=800&q=80" },
            { style: "Sleek Ponytail", desc: "Highlights your forehead and jawline for a high-fashion look.", img: "https://images.unsplash.com/photo-1582095133179-bfd03e281907?auto=format&fit=crop&w=800&q=80" },
            { style: "Shoulder Length Cut", desc: "Classic versatility that suits almost any occasion.", img: "https://images.unsplash.com/photo-1574621100236-d25b64cfdd63?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    Square: {
        Male: [
            { style: "Faded Textured Crop", desc: "Softens the strong, angular lines of your masculine jaw.", img: "/images/hairstyles/men_square_crop.png" },
            { style: "Side Part Taper", desc: "A professional look that aligns with your strong structural features.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
            { style: "Buzz Cut Fade", desc: "Highlights your strong skull structure and masculine geometry.", img: "https://images.unsplash.com/photo-1595152452543-e5cca283f58c?auto=format&fit=crop&w=800&q=80" },
            { style: "Messy Spikes", desc: "Adds verticality to balance the horizontal width of your face.", img: "https://images.unsplash.com/photo-1583327129759-715ce920a232?auto=format&fit=crop&w=800&q=80" },
            { style: "Ivy League", desc: "Sophisticated and clean, emphasizing a refined jawline.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80" },
            { style: "Flat Top", desc: "Plays into the boxy, strong nature of your square face shape.", img: "https://images.unsplash.com/photo-1622286332307-0c73a9483321?auto=format&fit=crop&w=800&q=80" }
        ],
        Female: [
            { style: "Voluminous Curls", desc: "Soft circular movement to counteract a sharp jawline.", img: "https://images.unsplash.com/photo-1580618672591-eb1c96b5007e?auto=format&fit=crop&w=800&q=80" },
            { style: "Feathered Shag", desc: "Texture around the jaw diffuses strong angular corners.", img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80" },
            { style: "Deep Side Part", desc: "Asymmetry that makes the face look narrower and softer.", img: "https://images.unsplash.com/photo-1632207191677-7813a17e0d3c?auto=format&fit=crop&w=800&q=80" },
            { style: "Wavy LOB", desc: "A Long Bob that hits below the jaw to elongate your shape.", img: "https://images.unsplash.com/photo-1534030347209-7147fd9e7f1a?auto=format&fit=crop&w=800&q=80" },
            { style: "Side Swept Bangs", desc: "Breaks up the forehead width and softens facial angles.", img: "https://images.unsplash.com/photo-1513244766819-e01b9ad9dbda?auto=format&fit=crop&w=800&q=80" },
            { style: "Layered Haircut", desc: "Long layers starting at the jawline help reduce squareness.", img: "https://images.unsplash.com/photo-1592398539074-ce46b1494632?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    Round: {
        Male: [
            { style: "High Volume Quiff", desc: "Delivers maximum vertical lift to elongate your circular profile.", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80" },
            { style: "Pompadour Fade", desc: "Slicked up and back provides necessary height and angles.", img: "https://images.unsplash.com/photo-1590246814883-577555a3089d?auto=format&fit=crop&w=800&q=80" },
            { style: "Angular Faux Hawk", desc: "Directly counters roundness by adding sharp, pointed volume.", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80" },
            { style: "Hard Side Part", desc: "Creates a sharp visual line to break up facial circularity.", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80" },
            { style: "Brushed Back Fade", desc: "Adds structured volume to give the face a more oval appearance.", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80" },
            { style: "Spiky Skin Fade", desc: "Sharp spikes add height and break the round silhouette.", img: "https://images.unsplash.com/photo-1622286332307-0c73a9483321?auto=format&fit=crop&w=800&q=80" }
        ],
        Female: [
            { style: "Pixie with Height", desc: "Vertical edges provide much-needed contrast to round traits.", img: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80" },
            { style: "Asymmetrical Bob", desc: "Diagonal flow that cuts through the circular face geometry.", img: "/images/hairstyles/women_round_bob.png" },
            { style: "Sleek Side Part", desc: "Reduces perceived width by focusing on long vertical lines.", img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80" },
            { style: "Long Shag", desc: "Crown-focused volume that helps create an oval illusion.", img: "https://images.unsplash.com/photo-1492106087820-71f1717878e2?auto=format&fit=crop&w=800&q=80" },
            { style: "Layered Lob", desc: "Longer strands draw the eye down, elongating the face.", img: "https://images.unsplash.com/photo-1582095133179-bfd03e281907?auto=format&fit=crop&w=800&q=80" },
            { style: "Long Straight Part", desc: "Creates the illusion of a narrower face with vertical lines.", img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    Heart: {
        Male: [
            { style: "Textured Slick Back", desc: "Adds volume to the top while keeping sides neat for balance.", img: "/images/hairstyles/men_heart_slickback.png" },
            { style: "Long Fringe", desc: "Balances a wide forehead and narrows the upper face.", img: "https://images.unsplash.com/photo-1593702295094-ada75ec38835?auto=format&fit=crop&w=800&q=80" },
            { style: "Side Part with Beard", desc: "Adds width to the jawline for a more masculine balance.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
            { style: "Classic Crew Cut", desc: "Simple and neat, focusing attention on your facial structure.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" }
        ],
        Female: [
            { style: "Chin-Length Bob", desc: "Creates necessary width at the narrowest part of your jaw.", img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80" },
            { style: "Side-Swept Pixie", desc: "Softens the forehead while drawing eyes to your features.", img: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80" },
            { style: "Wispy Bangs", desc: "Blurs the wide forehead line for a softer, balanced look.", img: "https://images.unsplash.com/photo-1513244766819-e01b9ad9dbda?auto=format&fit=crop&w=800&q=80" },
            { style: "Long Curls", desc: "Volume around the neck adds width to balance the facial shape.", img: "https://images.unsplash.com/photo-1580618672591-eb1c96b5007e?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    Long: {
        Male: [
            { style: "Classic Side Part", desc: "Avoids adding vertical height and adds width to the profile.", img: "/images/hairstyles/men_long_sidepart.png" },
            { style: "Man Fringe", desc: "Shortens the appearance of the face by covering the forehead.", img: "https://images.unsplash.com/photo-1593702295094-ada75ec38835?auto=format&fit=crop&w=800&q=80" },
            { style: "Textured Scissor Cut", desc: "Maintains fullness on the sides to create a wider look.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" },
            { style: "Buzz Cut", desc: "Even length all around ensures no extra height is added.", img: "https://images.unsplash.com/photo-1595152452543-e5cca283f58c?auto=format&fit=crop&w=800&q=80" }
        ],
        Female: [
            { style: "Full Blunt Bangs", desc: "Effectively 'shortens' the face by lowering the upper visual limit.", img: "/images/hairstyles/women_long_bangs.png" },
            { style: "Voluminous Curls", desc: "Horizontal volume counters the face's vertical length.", img: "https://images.unsplash.com/photo-1580618672591-eb1c96b5007e?auto=format&fit=crop&w=800&q=80" },
            { style: "Curly Bob", desc: "Short and bouncy, adding much-needed width to the sides.", img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80" },
            { style: "Middle Part Layers", desc: "Frame the face to create width around the cheekbones.", img: "https://images.unsplash.com/photo-1492106087820-71f1717878e2?auto=format&fit=crop&w=800&q=80" }
        ]
    },
    Diamond: {
        Male: [
            { style: "Messy Fringe", desc: "Adds width to the forehead to balance sharp cheekbones.", img: "https://images.unsplash.com/photo-1583327129759-715ce920a232?auto=format&fit=crop&w=800&q=80" },
            { style: "Textured Quiff", desc: "Volume on top provides a softer, balanced geometric profile.", img: "https://images.unsplash.com/photo-1622286332307-0c73a9483321?auto=format&fit=crop&w=800&q=80" },
            { style: "Side Swept Part", desc: "Reduces the appearance of facial width at the cheekbones.", img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80" },
            { style: "Long Scissor Cut", desc: "Fullness around the ears fills in the narrow jaw and forehead.", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80" }
        ],
        Female: [
            { style: "Side-Swept Bangs", desc: "Aids in narrowing the appearance of prominent cheekbones.", img: "https://images.unsplash.com/photo-1513244766819-e01b9ad9dbda?auto=format&fit=crop&w=800&q=80" },
            { style: "Face-Framing Layers", desc: "Softens the overall sharp angles of the diamond shape.", img: "https://images.unsplash.com/photo-1592398539074-ce46b1494632?auto=format&fit=crop&w=800&q=80" },
            { style: "Long Wavy Hair", desc: "Movement around the chin adds necessary volume to the jaw.", img: "https://images.unsplash.com/photo-1635273051937-6030999086e3?auto=format&fit=crop&w=800&q=80" },
            { style: "Tucked-Back Bob", desc: "Highlights the eyes and softens the high cheekbones.", img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80" }
        ]
    }
};

const HairStyling = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeRec, setActiveRec] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getHistory();
                if (res.data && res.data.length > 0) setUserData(res.data[0]);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-[6px] border-slate-50 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Loading Studio Assets...</p>
        </div>
    );

    if (!userData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-24 h-24 bg-white shadow-xl rounded-3xl flex items-center justify-center text-indigo-500 text-4xl mb-8 border border-white">
                    <FaShapes />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Analysis Required</h2>
                <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">Please perform a face scan to unlock professional styling assets tailored to your profile.</p>
                <button onClick={() => window.location.href = '/analyze'} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl">
                    Open VisionCore
                </button>
            </div>
        );
    }

    const { face_shape, gender } = userData;
    const recommendations = (HAIR_ASSETS[face_shape || "Oval"] || HAIR_ASSETS.Oval)[gender || "Female"] || [];

    return (
        <div className="min-h-screen bg-white text-slate-900">
            {/* CLEAN MINIMAL HEADER */}
            <div className="relative pt-24 pb-16 px-10 bg-slate-50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Studio Mode</span>
                            <span className="text-slate-300 font-bold text-xs uppercase tracking-widest">Precision Style Lab</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight uppercase leading-none">
                            High-End <span className="text-indigo-600">Cut</span>
                        </h1>
                        <p className="text-slate-500 text-lg font-medium max-w-xl">
                            Expert recommendations for your <span className="text-slate-900 font-bold underline decoration-indigo-400 decoration-4 underline-offset-4">{face_shape || 'Oval'}</span> face shape.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Morphology</div>
                            <div className="text-3xl font-black text-slate-900">{face_shape || 'Oval'}</div>
                        </div>
                        <div className="w-16 h-16 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-indigo-600 text-2xl border border-slate-100">
                            <FaShapes />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-24 px-10">

                {/* LARGE FEATURED RECOMMENDATION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-indigo-50 rounded-[4rem] group-hover:bg-indigo-100 transition-colors duration-500"></div>
                        <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl bg-slate-100">
                            <img
                                src={recommendations[activeRec]?.img}
                                alt="Style Preview"
                                className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-[2s]"
                                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop"}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                            <div className="absolute bottom-12 left-12 right-12">
                                <h3 className="text-white text-5xl font-black uppercase tracking-tighter leading-none mb-4">{recommendations[activeRec]?.style}</h3>
                                <div className="flex items-center gap-2 text-indigo-400 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-xl">
                                    <FaStar /> <span className="text-[10px] font-black uppercase tracking-widest text-white">Algorithmically Perfect Match</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-xl"><FaMagic /></div>
                            <h2 className="text-4xl font-black uppercase tracking-tight">The <span className="text-indigo-600">Geometric</span> Verdict</h2>
                            <p className="text-slate-500 text-xl font-medium leading-relaxed">
                                {recommendations[activeRec]?.desc}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Select Style Variant</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {recommendations.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveRec(idx)}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 ${activeRec === idx ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl translate-x-1' : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black uppercase tracking-tight">{item.style}</span>
                                            {activeRec === idx && <FaChevronRight />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CLINICAL INSIGHTS BAR */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col gap-6 group hover:translate-y-[-5px] transition-all">
                        <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-indigo-600 text-xl group-hover:scale-110 transition-transform"><FaInfoCircle /></div>
                        <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest leading-none">Symmetry Logic</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">Styles are prioritized using vertex mapping to create a clinical visual balance with your profile.</p>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col gap-6 group hover:translate-y-[-5px] transition-all">
                        <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-purple-600 text-xl group-hover:scale-110 transition-transform"><FaPalette /></div>
                        <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest leading-none">Color Match</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">Calculated light interaction based on your unique pigment density for the most radiant hair tones.</p>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col gap-6 group hover:translate-y-[-5px] transition-all">
                        <div className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-emerald-600 text-xl group-hover:scale-110 transition-transform"><FaCheckCircle /></div>
                        <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest leading-none">Stylist Ready</h4>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">Export your morphological profile as a high-definition PDF reference for your next salon visit.</p>
                    </div>
                </div>

            </main>

            {/* MINIMAL FOOTER */}
            <footer className="py-20 px-10 border-t border-slate-100 text-center">
                <button className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-2xl">
                    Export Style Dossier
                </button>
            </footer>
        </div>
    );
};

export default HairStyling;
