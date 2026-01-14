import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaCog, FaSignOutAlt, FaClock } from "react-icons/fa";

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Time State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper: Get Greeting based on hour
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Helper: Extract name from token (Base64 decode)
  const getUserName = () => {
    if (!token) return "Guest";
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      // Return name before @ of email
      return payload.sub ? payload.sub.split('@')[0] : "User";
    } catch (e) {
      return "User";
    }
  };

  const userName = getUserName();
  const greeting = getGreeting();
  // Format time: HH:MM AM/PM
  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate Page Title from Path
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    if (path === "analyze") return "Ready for Analysis 📸";
    if (path === "live") return "Live Diagnostic 🎥";
    if (path === "trends") return "Skin Trends 📈";
    if (path === "hair") return "Hair Styling 💇";
    if (path === "nails") return "Nail Studio 💅";
    return "Dashboard";
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm border-b border-gray-100 transition-all">

      {/* Left: Page Title / Breadcrumbs */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800">
          {getPageTitle()}
        </h1>
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          AI BEAUTY CONSULTANT / {location.pathname.split("/").pop().toUpperCase()}
        </p>
      </div>

      {/* Center: Greetings & Time */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-6">
        {/* Time Badge */}
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 text-gray-600 font-mono text-sm shadow-sm hover:shadow-md transition-shadow">
          <FaClock className="text-blue-400" />
          <span>{timeString}</span>
        </div>

        {/* Greeting Text */}
        <div className="flex flex-col text-left">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{greeting}</span>
          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 capitalize">
            {userName}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 border-l border-gray-200 pl-4 ml-auto">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 rounded-full hover:bg-gray-100 text-gray-500 transition relative"
          >
            <FaBell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {/* Dropdown Mockup */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-fade-in-up">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Notifications</h4>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full shrink-0"></div>
                  <p className="text-sm text-gray-600">New Hair Styling features added! Check sidebar.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 mt-1.5 bg-green-500 rounded-full shrink-0"></div>
                  <p className="text-sm text-gray-600">Your analysis history is saved securely.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Settings */}
        <button className="p-3 rounded-full hover:bg-gray-100 text-gray-500 transition">
          <FaCog size={18} />
        </button>

        {/* Logout Button (Styled) */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-full text-red-600 font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
        >
          <FaSignOutAlt />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
