import React, { useState } from 'react';
import { FaFemale, FaMale, FaSpa, FaLeaf, FaGem, FaTint } from 'react-icons/fa';

const SERVICE_DATA = {
    Female: {
        "Signature Combos": [
            { name: "Total Radiance Package", price: "₹2,999", desc: "Pearl Facial + Hair Spa + Threading (Save ₹500)." },
            { name: "Bridal Glow Essentials", price: "₹5,500", desc: "Gold Facial + Body Polishing + Premium Mani-Pedi." }
        ],
        "Glow & Brightening": [
            { name: "Oxygen Facial", price: "₹1,500", desc: "Infuses pure oxygen for an instant, radiant glow." },
            { name: "Pearl Whitening Facial", price: "₹2,200", desc: "Polishes skin surface for a porcelain finish." },
            { name: "24K Gold Facial", price: "₹3,200", desc: "Luxury anti-aging treatment for elasticity." }
        ],
        "Acne & Detox": [
            { name: "Herbal Face Cleanup", price: "₹655", desc: "Neem and Tulsi fast-acting cleanup for breakouts." },
            { name: "Advanced Acne Repair", price: "₹1,800", desc: "Targeted clinical facial for persistent acne." },
            { name: "Mattifying Clean-up", price: "₹600", desc: "Controls shine and tightens pores." }
        ],
        "Hydration & Indulgence": [
            { name: "Honey & Milk Hydration", price: "₹1,600", desc: "Classic hydration for soft, supple skin." },
            { name: "Choco-Divine Facial", price: "₹2,200", desc: "Antioxidant-rich cocoa butter treatment for deep moisture." },
            { name: "Collagen Boost", price: "₹3,500", desc: "Firms sagging skin and reduces fine lines." }
        ],
        "Hair & Body": [
            { name: "Keratin Protect", price: "₹1,720", desc: "Smooths frizz and adds manageable shine." },
            { name: "Ice Cream Manicure", price: "₹440", desc: "Fun, flavored soak and scrub for soft hands." },
            { name: "Paraffin Pedicure", price: "₹795", desc: "Deep heat treatment for cracked heels and dry feet." }
        ]
    },
    Male: {
        "Combos": [
            { name: "The Gentleman's Cut & Detox", price: "₹999", desc: "Haircut + Charcoal De-Tan + Beard Trim." },
            { name: "Wedding Ready Groom", price: "₹4,500", desc: "Gold Facial + Manicure + Pedicure + Hair Spa." }
        ],
        "Detox & Oil Control": [
            { name: "Herbal Face Cleanup", price: "₹655", desc: "Antiseptic treatment to clear active acne." },
            { name: "Charcoal De-Tan", price: "₹500", desc: "Activated charcoal mask to absorb oil and pollution." },
            { name: "Oil Control Clean-up", price: "₹545", desc: "Deep pore cleansing to remove excess sebum." }
        ],
        "Grooming & Glow": [
            { name: "Oxygen Facial", price: "₹1,500", desc: "Infuses pure oxygen for an instant, radiant glow." },
            { name: "Global Gold Facial", price: "₹3,000", desc: "Premium radiance treatment for grooms." },
            { name: "Skin Lightening Cleanup", price: "₹730", desc: "Reduces marks and balances skin tone." }
        ],
        "Hair & Texture": [
            { name: "Anti-Dandruff Treatment", price: "₹1,210", desc: "Clinical treatment to clear scalp buildup." },
            { name: "L'Oreal Hair Spa", price: "₹845", desc: "Relaxing massage and mask for hair vitality." },
            { name: "Crystal Microdermabrasion", price: "₹2,500", desc: "Resurfacing treatment for acne scars." }
        ]
    }
};

const ServicesPage = () => {
    const [activeTab, setActiveTab] = useState("Female");

    return (
        <div className="min-h-screen bg-gray-50 p-8 animate-fade-in-up">

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 mb-4">
                    Professional Skin Services
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                    Explore our premium range of facials and treatments, curated to deliver visible results for every skin type.
                </p>
            </div>

            {/* Gender Toggle */}
            <div className="flex justify-center mb-12">
                <div className="bg-white p-1.5 rounded-full shadow-md border border-gray-100 flex">
                    <button
                        onClick={() => setActiveTab("Female")}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "Female"
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <FaFemale size={16} /> FOR HER
                    </button>
                    <button
                        onClick={() => setActiveTab("Male")}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "Male"
                            ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <FaMale size={16} /> FOR HIM
                    </button>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-6xl mx-auto space-y-12">
                {Object.entries(SERVICE_DATA[activeTab]).map(([category, services]) => (
                    <div key={category}>
                        <div className="flex items-center gap-3 mb-6">
                            <CategoryIcon category={category} />
                            <h3 className="text-2xl font-bold text-gray-800">{category}</h3>
                            <div className="h-px bg-gray-200 flex-1 ml-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((svc, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {svc.name}
                                        </h4>
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold">
                                            {svc.price}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                        {svc.desc}
                                    </p>
                                    <button className="text-sm font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Book Now →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

const CategoryIcon = ({ category }) => {
    if (category.includes("Combo") || category.includes("Signature")) return <span className="text-2xl">⭐</span>;
    if (category.includes("Acne") || category.includes("Detox")) return <FaLeaf className="text-green-500 text-xl" />;
    if (category.includes("Hydration")) return <FaTint className="text-blue-400 text-xl" />;
    if (category.includes("Gold") || category.includes("Glow")) return <FaGem className="text-yellow-500 text-xl" />;
    return <FaSpa className="text-purple-500 text-xl" />;
};

export default ServicesPage;
