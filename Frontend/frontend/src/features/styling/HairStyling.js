import { useEffect, useState } from "react";
import { getHistory } from "../../services/api";

const HAIR_RECOMMENDATIONS = {
    Oval: {
        Male: [
            { style: "Pompadour", desc: "Adds volume on top, balancing symmetry.", img: "https://images.unsplash.com/photo-1521146764736-56c929d59c83?auto=format&fit=crop&w=600&q=80" },
            { style: "Undercut", desc: "Clean sides highlight the perfect geometry.", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80" },
            { style: "Buzz Cut", desc: "Minimalist look that highlights facial features.", img: "https://images.unsplash.com/photo-1595152452543-e5cca283f58c?auto=format&fit=crop&w=600&q=80" },
            { style: "Slick Back", desc: "Formal and timeless on an oval face.", img: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?auto=format&fit=crop&w=600&q=80" }
        ],
        Female: [
            { style: "Long Layers", desc: "Enhances natural movement without hiding features.", img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80" },
            { style: "Blunt Bob", desc: "Sharp lines contrast beautifully with soft curves.", img: "https://images.unsplash.com/photo-1502479532585-618a5948f98d?auto=format&fit=crop&w=600&q=80" },
            { style: "Curtain Bangs", desc: "Trendy framing that suits oval shapes perfectly.", img: "https://images.unsplash.com/photo-1595959120641-58e369b05485?auto=format&fit=crop&w=600&q=80" },
            { style: "Beach Waves", desc: "Effortless volume for a balanced look.", img: "https://images.unsplash.com/photo-1526045431048-f857369baa09?auto=format&fit=crop&w=600&q=80" }
        ]
    },
    Square: {
        Male: [
            { style: "Textured Crop", desc: "Softens the strong jawline.", img: "https://images.unsplash.com/photo-1616805763604-d610b4538491?auto=format&fit=crop&w=600&q=80" },
            { style: "Side Part", desc: "Classic look that complements angular features.", img: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80" },
            { style: "Crew Cut", desc: "Rugged and low maintenance.", img: "https://images.unsplash.com/photo-1617260029566-f155990264b3?auto=format&fit=crop&w=600&q=80" },
            { style: "Messy Quiff", desc: "Adds height to balance the width.", img: "https://images.unsplash.com/photo-1503443207934-239a8194a308?auto=format&fit=crop&w=600&q=80" }
        ],
        Female: [
            { style: "Soft Waves", desc: "Diffuses the angles of the jaw.", img: "https://images.unsplash.com/photo-1580618672591-eb1c96b5007e?auto=format&fit=crop&w=600&q=80" },
            { style: "Long Angles", desc: "Elongates the face shape.", img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80" },
            { style: "Shag Cut", desc: "Retro layers soften the jawline.", img: "https://images.unsplash.com/photo-1605993439219-9d09d2020fa5?auto=format&fit=crop&w=600&q=80" },
            { style: "Sleek Straight", desc: "Highlights strong features confidently.", img: "https://images.unsplash.com/photo-1632207191677-7813a17e0d3c?auto=format&fit=crop&w=600&q=80" }
        ]
    },
    Round: {
        Male: [
            { style: "High Quiff", desc: "Adds height to elongate the face.", img: "https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=600&q=80" },
            { style: "Faux Hawk", desc: "Creates vertical lines and structure.", img: "https://images.unsplash.com/photo-1520338661084-680395057c93?auto=format&fit=crop&w=600&q=80" },
            { style: "Angular Fringe", desc: "Introduces angles to a round face.", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80" },
            { style: "Side Swept", desc: "Asymmetry breaks the circle.", img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80" }
        ],
        Female: [
            { style: "Pixie Cut", desc: "Adds volume on top to lengthen profile.", img: "/images/styles/custom_pixie.jpg" },
            { style: "Deep Side Part", desc: "Asymmetry breaks up the roundness.", img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80" },
            { style: "Textured Lob", desc: "Vertical lines slim the face.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" },
            { style: "Asymmetrical Bob", desc: "Edgy lines counter softness.", img: "https://images.unsplash.com/photo-1534030347209-7147fd9e7f1a?auto=format&fit=crop&w=600&q=80" }
        ]
    },
    Diamond: {
        Male: [
            { style: "Fringe Up", desc: "Balances narrow forehead.", img: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=600&q=80" },
            { style: "Messy Waves", desc: "Adds width to the forehead area.", img: "https://images.unsplash.com/photo-1616805763604-d610b4538491?auto=format&fit=crop&w=600&q=80" },
            { style: "Man Bun", desc: "Keeps hair off the face, highlighting bone structure.", img: "https://images.unsplash.com/photo-1515202913161-8a48383721a7?auto=format&fit=crop&w=600&q=80" },
            { style: "Scissor Cut", desc: "Soft textured sides.", img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80" }
        ],
        Female: [
            { style: "Chin Length Bob", desc: "Adds width to the narrow jawline.", img: "https://plus.unsplash.com/premium_photo-1669865181755-f2eb89679658?auto=format&fit=crop&w=600&q=80" },
            { style: "Pulled Back", desc: "Shows off the amazing cheekbones.", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80" },
            { style: "Wispy Bangs", desc: "Softens the forehead angles.", img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=600&q=80" },
            { style: "Hollywood Waves", desc: "Glamorous volume at the jawline.", img: "https://images.unsplash.com/photo-1582250265223-956557378fa4?auto=format&fit=crop&w=600&q=80" }
        ]
    },
    Long: {
        Male: [
            { style: "Side Part", desc: "Adds width to balance length.", img: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80" },
            { style: "Buzz Cut", desc: "Minimizes vertical length.", img: "https://images.unsplash.com/photo-1595152452543-e5cca283f58c?auto=format&fit=crop&w=600&q=80" },
            { style: "Caesar Cut", desc: "Short bangs shorten the forehead.", img: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80" },
            { style: "Crew Cut", desc: "Balanced and clean.", img: "https://images.unsplash.com/photo-1617260029566-f155990264b3?auto=format&fit=crop&w=600&q=80" }
        ],
        Female: [
            { style: "Shoulder Length Waves", desc: "Adds volume to the sides.", img: "https://images.unsplash.com/photo-1580618672591-eb1c96b5007e?auto=format&fit=crop&w=600&q=80" },
            { style: "Chin Length Bob", desc: "Balances facial length.", img: "https://images.unsplash.com/photo-1502479532585-618a5948f98d?auto=format&fit=crop&w=600&q=80" },
            { style: "Bangs", desc: "Shortens the appearance of the forehead.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80" },
            { style: "Curly Shag", desc: "Width and texture are your friends.", img: "https://images.unsplash.com/photo-1581467655410-0c218a3b03d6?auto=format&fit=crop&w=600&q=80" }
        ]
    },
    Heart: {
        Male: [
            { style: "Mid-Length Layered", desc: "Balances a narrow angular chin.", img: "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?auto=format&fit=crop&w=600&q=80" },
            { style: "Side Swept", desc: "Softens the forehead width.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
            { style: "Volume on Top", desc: "Draws attention to eyes.", img: "https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=600&q=80" },
            { style: "Long Fringe", desc: "Balances the upper face.", img: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?auto=format&fit=crop&w=600&q=80" }
        ],
        Female: [
            { style: "Long Layers", desc: "Softens the strong jawline.", img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80" },
            { style: "Pixie Cut", desc: "Highlights cheekbones while softening chin.", img: "/images/styles/custom_pixie.jpg" },
            { style: "Side Part Bob", desc: "Minimizes forehead width.", img: "https://images.unsplash.com/photo-1534030347209-7147fd9e7f1a?auto=format&fit=crop&w=600&q=80" },
            { style: "Wavy Lob", desc: "Adds volume near the jawline.", img: "https://images.unsplash.com/photo-1526045431048-f857369baa09?auto=format&fit=crop&w=600&q=80" }
        ]
    }
};
// Fallback
HAIR_RECOMMENDATIONS.Triangle = HAIR_RECOMMENDATIONS.Square;

const HairStyling = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getHistory();
            if (res.data && res.data.length > 0) {
                // Use the most recent scan
                setUserData(res.data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">No Face Data Found</h2>
                <p className="text-gray-500">Please run a Face Analysis first so we can recommend hairstyles!</p>
            </div>
        );
    }

    const { face_shape, gender } = userData;
    // Default to Female/Oval if data missing
    const userGender = gender || "Female";
    const userShape = face_shape || "Oval";

    // Get Recommendations
    const recs = (HAIR_RECOMMENDATIONS[userShape] || HAIR_RECOMMENDATIONS.Oval)[userGender] || [];

    return (
        <div className="min-h-screen bg-gray-50 p-6 animate-fade-in-up">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Hair Styling Studio 💇</h1>
                    <p className="text-gray-500 text-lg">
                        Personalized for your <span className="font-bold text-blue-600">{userShape}</span> face shape.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {recs.map((style, idx) => (
                        <div key={idx} className="bg-white rounded-3xl shadow-xl overflow-hidden group border border-gray-100">
                            <div className="h-[400px] overflow-hidden relative">
                                <img
                                    src={style.img}
                                    alt={style.style}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20">
                                    <h3 className="text-2xl font-bold text-white mb-1">{style.style}</h3>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-500 leading-relaxed">{style.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hair Color Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        🎨 Trending Hair Colors <span className="text-sm font-normal text-gray-500 ml-2">(Experiment!)</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Chestnut Brown", img: "https://images.unsplash.com/photo-1492106087820-71f1717878e2?auto=format&fit=crop&w=400&q=80", desc: "Warm & Natural" },
                            { name: "Platinum Blonde", img: "https://images.unsplash.com/photo-1519699047748-40ba4428f61e?auto=format&fit=crop&w=400&q=80", desc: "Bold & Edgy" },
                            { name: "Midnight Blue", img: "https://images.unsplash.com/photo-1625298075344-969460595304?auto=format&fit=crop&w=400&q=80", desc: "Deep & Mysterious" },
                            { name: "Burgundy", img: "https://images.unsplash.com/photo-1580618672591-eb1c96b5007e?auto=format&fit=crop&w=400&q=80", desc: "Rich & Vibrant" }
                        ].map((c, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="w-20 h-20 rounded-full shadow-md border-4 border-white group-hover:scale-110 transition-transform overflow-hidden">
                                    <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-gray-800">{c.name}</div>
                                    <div className="text-xs text-gray-400">{c.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center text-blue-800">
                    💡 <strong>Pro Tip:</strong> These styles are mathematically chosen to balance your features.
                    Show these references to your stylist!
                </div>
            </div>
        </div>
    );
};

export default HairStyling;
