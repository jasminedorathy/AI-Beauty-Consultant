import React, { useState } from 'react';
import { FaFemale, FaMale, FaSpa, FaLeaf, FaGem, FaTint, FaCalendarAlt, FaClock, FaUser, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { bookAppointment } from '../../services/appointmentApi';

const SERVICE_DATA = {
    Female: {
        "Signature Combos": [
            { name: "Total Radiance Package", price: "₹2,999", desc: "Pearl Facial + Hair Spa + Threading (Save ₹500)." },
            { name: "Bridal Glow Essentials", price: "₹5,500", desc: "Gold Facial + Body Polishing + Premium Mani-Pedi." },
            { name: "Glass Skin Ritual", price: "₹4,200", desc: "Double Cleanse + Hydra Facial + Sheet Mask + LED therapy." }
        ],
        "Glow & Brightening": [
            { name: "Oxygen Facial", price: "₹1,500", desc: "Infuses pure oxygen for an instant, radiant glow." },
            { name: "Pearl Whitening Facial", price: "₹2,200", desc: "Polishes skin surface for a porcelain finish." },
            { name: "24K Gold Facial", price: "₹3,200", desc: "Luxury anti-aging treatment for elasticity." },
            { name: "Vitamin C Radiance", price: "₹1,800", desc: "High-potency antioxidant treatment for sun-damaged skin." }
        ],
        "Acne & Detox": [
            { name: "Herbal Face Cleanup", price: "₹655", desc: "Neem and Tulsi fast-acting cleanup for breakouts." },
            { name: "Advanced Acne Repair", price: "₹1,800", desc: "Targeted clinical facial for persistent acne." },
            { name: "Mattifying Clean-up", price: "₹600", desc: "Controls shine and tightens pores." },
            { name: "Urban Defense Facial", price: "₹2,100", desc: "Shields skin from pollutants and removes deep-seated grime." }
        ],
        "Hydration & Rejuvenation": [
            { name: "Honey & Milk Hydration", price: "₹1,600", desc: "Classic hydration for soft, supple skin." },
            { name: "Choco-Divine Facial", price: "₹2,200", desc: "Antioxidant-rich cocoa butter treatment for deep moisture." },
            { name: "Collagen Boost", price: "₹3,500", desc: "Firms sagging skin and reduces fine lines." },
            { name: "Hyaluronic Deep Sea", price: "₹2,800", desc: "Ultra-hydrating treatment using concentrated marine extracts." }
        ],
        "Clinical & Advanced": [
            { name: "Retinol Renewal", price: "₹3,800", desc: "Targeted clinical facial to reduce fine lines and visible pores." },
            { name: "Blue Light Protection", price: "₹1,400", desc: "Neutralizes digital screen damage and refreshes tired skin." },
            { name: "Derma-Peel Expert", price: "₹2,500", desc: "Chemical exfoliation for deep pigmentation and scarring." }
        ],
        "Hair & Body": [
            { name: "Keratin Protect", price: "₹1,720", desc: "Smooths frizz and adds manageable shine." },
            { name: "Ice Cream Manicure", price: "₹440", desc: "Fun, flavored soak and scrub for soft hands." },
            { name: "Paraffin Pedicure", price: "₹795", desc: "Deep heat treatment for cracked heels and dry feet." }
        ]
    },
    Male: {
        "Executive Combos": [
            { name: "The Gentleman's Cut & Detox", price: "₹999", desc: "Haircut + Charcoal De-Tan + Beard Trim." },
            { name: "Wedding Ready Groom", price: "₹4,500", desc: "Gold Facial + Manicure + Pedicure + Hair Spa." },
            { name: "Boardroom Prep", price: "₹1,800", desc: "Express Cleanup + Eyebrow Grooming + Relaxing Head Massage." }
        ],
        "Detox & Oil Control": [
            { name: "Herbal Face Cleanup", price: "₹655", desc: "Antiseptic treatment to clear active acne." },
            { name: "Charcoal De-Tan", price: "₹500", desc: "Activated charcoal mask to absorb oil and pollution." },
            { name: "Oil Control Clean-up", price: "₹545", desc: "Deep pore cleansing to remove excess sebum." },
            { name: "Volcanic Ash Detox", price: "₹1,200", desc: "Intense mineral treatment for stubborn blackheads and dirt." }
        ],
        "Skin Recovery": [
            { name: "Sports Recovery Facial", price: "₹1,400", desc: "Deep cooling treatment for skin exposed to sun and sweat." },
            { name: "Sun Damage Repair", price: "₹1,600", desc: "Reverses intense tanning and repairs UV DNA damage." },
            { name: "Anti-Fatigue Therapy", price: "₹1,100", desc: "Instant recharge for stressed, dull, and caffeine-tired skin." }
        ],
        "Grooming & Glow": [
            { name: "Oxygen Facial", price: "₹1,500", desc: "Infuses pure oxygen for an instant, radiant glow." },
            { name: "Global Gold Facial", price: "₹3,000", desc: "Premium radiance treatment for grooms." },
            { name: "Skin Lightening Cleanup", price: "₹730", desc: "Reduces marks and balances skin tone." },
            { name: "Beard & Skin Therapy", price: "₹850", desc: "Specialized care for the skin under the beard to prevent itch." }
        ],
        "Clinical & Texture": [
            { name: "Anti-Dandruff Treatment", price: "₹1,210", desc: "Clinical treatment to clear scalp buildup." },
            { name: "Crystal Microderm", price: "₹2,500", desc: "Resurfacing treatment for deep acne scars and texture." },
            { name: "Digital Detox Facial", price: "₹1,200", desc: "Protects against HEV (Blue Light) from digital screen exposure." }
        ]
    }
};

const ServicesPage = () => {
    const [activeTab, setActiveTab] = useState("Female");
    const [selectedService, setSelectedService] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingRef, setBookingRef] = useState(null);
    const [bookingData, setBookingData] = useState({
        name: '',
        date: '',
        time: ''
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleBook = (category, service) => {
        setSelectedService({ ...service, category });
        setIsBookingModalOpen(true);
        setBookingRef(null);
        setError(null);
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                service_name: selectedService.name,
                customer_name: bookingData.name,
                appointment_date: bookingData.date,
                appointment_time: bookingData.time,
                category: selectedService.category,
                gender: activeTab
            };

            const result = await bookAppointment(payload);
            setBookingRef(result.booking_ref);

            setTimeout(() => {
                setIsBookingModalOpen(false);
                setBookingData({ name: '', date: '', time: '' });
                setBookingRef(null);
            }, 5000);
        } catch (err) {
            console.error('Booking failed:', err);
            setError(err.response?.data?.detail || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                            ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow-lg"
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
                                    <button
                                        onClick={() => handleBook(category, svc)}
                                        className="text-sm font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                    >
                                        Book Now →
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-blue-600 p-6 text-white relative">
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-all"
                            >
                                <FaTimes />
                            </button>
                            <h3 className="text-2xl font-bold mb-2">Book Appointment</h3>
                            <p className="text-teal-50 opacity-90">{selectedService?.name}</p>
                        </div>

                        <div className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-shake">
                                    <FaExclamationCircle className="mt-1 flex-shrink-0" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {!bookingRef ? (
                                <form onSubmit={handleConfirmBooking} className="space-y-6">
                                    {/* ... rest of the form ... */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <FaUser className="text-teal-500" /> Full Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={bookingData.name}
                                            onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                                            placeholder="Enter your name"
                                            className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-teal-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <FaCalendarAlt className="text-teal-500" /> Date
                                            </label>
                                            <input
                                                required
                                                type="date"
                                                value={bookingData.date}
                                                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-teal-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <FaClock className="text-teal-500" /> Time
                                            </label>
                                            <select
                                                required
                                                value={bookingData.time}
                                                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-teal-500 transition-all outline-none"
                                            >
                                                <option value="">Select Time</option>
                                                <option value="10:00 AM">10:00 AM</option>
                                                <option value="11:00 AM">11:00 AM</option>
                                                <option value="12:00 PM">12:00 PM</option>
                                                <option value="01:00 PM">01:00 PM</option>
                                                <option value="02:00 PM">02:00 PM</option>
                                                <option value="03:00 PM">03:00 PM</option>
                                                <option value="04:00 PM">04:00 PM</option>
                                                <option value="05:00 PM">05:00 PM</option>
                                                <option value="06:00 PM">06:00 PM</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : 'Confirm Booking'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8 space-y-4 animate-bounce-in">
                                    <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
                                    <h4 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h4>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                                        <p className="font-mono text-xl font-bold text-teal-600">{bookingRef}</p>
                                    </div>
                                    <p className="text-gray-500 text-sm italic">
                                        We've saved your spot for {bookingData.time} on {bookingData.date}.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
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
