import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaCamera,
  FaChartLine,
  FaHistory,
  FaMagic,
  FaCut,
  FaPaintBrush,
  FaSpa,
  FaUserCircle
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl hidden md:flex flex-col z-20 font-sans border-r border-white/50 animate-slide-in-left">

      {/* Brand Logo */}
      <div className="p-8 pb-4 animate-fade-in-up">
        <div className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
            ✨
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600 tracking-tight">
              AI Beauty
            </h1>
            <span className="text-xs font-medium text-gray-400 tracking-wide">Consultant</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
        {/* Featured Dashboard Home Card */}
        <div className="animate-fade-in-up animation-delay-100 mb-6">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 group overflow-hidden ${isActive
                ? "bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-xl scale-105"
                : "bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 hover:shadow-lg hover:scale-105"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Background Shimmer Effect */}
                {!isActive && (
                  <div className="absolute inset-0 shimmer opacity-50"></div>
                )}

                {/* Icon */}
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-purple-600 group-hover:scale-110'
                  }`}>
                  <FaHome className="text-xl" />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className={`font-bold text-base ${isActive ? 'text-white' : 'text-purple-700'}`}>
                    Dashboard
                  </div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-purple-500'}`}>
                    Home & Overview
                  </div>
                </div>

                {/* Arrow */}
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-white translate-x-0' : 'text-purple-600 -translate-x-1 group-hover:translate-x-0'
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </NavLink>
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-2 animate-fade-in-up animation-delay-200">
          Analysis
        </div>
        <div className="animate-fade-in-up animation-delay-300">
          <NavItem to="/dashboard/analyze" icon={<FaMagic />} label="Face Analysis" />
        </div>
        <div className="animate-fade-in-up animation-delay-400">
          <NavItem to="/dashboard/live" icon={<FaCamera />} label="Live Camera" />
        </div>
        <div className="animate-fade-in-up animation-delay-500">
          <NavItem to="/dashboard/services" icon={<FaSpa />} label="Spa Services" badge="HOT" />
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6 animate-fade-in-up animation-delay-600">
          Styling Studio
        </div>
        <div className="animate-fade-in-up animation-delay-700">
          <NavItem to="/dashboard/hair" icon={<FaCut />} label="Hair Styling" badge="NEW" />
        </div>
        <div className="animate-fade-in-up animation-delay-800">
          <NavItem to="/dashboard/nails" icon={<FaPaintBrush />} label="Nail Studio" badge="NEW" />
        </div>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6 animate-fade-in-up animation-delay-900">
          Insights
        </div>
        <div className="animate-fade-in-up animation-delay-1000">
          <NavItem to="/dashboard/trends" icon={<FaChartLine />} label="Skin Trends" />
        </div>
        <div className="animate-fade-in-up animation-delay-1100">
          <NavItem to="/dashboard/history" icon={<FaHistory />} label="History" />
        </div>
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 m-4 bg-gradient-to-r from-purple-50 to-teal-50 rounded-2xl border border-purple-100 flex items-center gap-3 hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in-up animation-delay-1100">
        <div className="bg-gradient-to-br from-purple-500 to-teal-500 rounded-full p-2 text-white group-hover:scale-110 transition-transform shadow-lg">
          <FaUserCircle size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-700">Welcome User</p>
          <p className="text-xs text-gray-500">Free Plan</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label, badge, isHome }) => (
  <NavLink
    to={to}
    end={isHome}
    className={({ isActive }) =>
      `relative flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group overflow-hidden ${isActive
        ? "bg-gradient-to-r from-purple-50 to-teal-50 text-purple-700 font-bold shadow-md translate-x-1 scale-105"
        : "text-gray-500 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-teal-50/50 hover:text-gray-900 hover:translate-x-1 hover:scale-105"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Ripple Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-teal-400/10 to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Active Indicator Line */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-purple-500 to-teal-500 rounded-r-lg animate-pulse-glow" />
        )}

        <span className={`text-lg transition-all duration-300 group-hover:animate-bounce-subtle ${isActive
          ? 'text-purple-600 scale-110'
          : 'text-gray-400 group-hover:text-purple-500 group-hover:scale-125'
          }`}>
          {icon}
        </span>

        <span className="flex-1 transition-all duration-300 group-hover:translate-x-1">{label}</span>

        {/* Badge */}
        {badge && (
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse group-hover:scale-110 transition-transform">
            {badge}
          </span>
        )}

        {/* Animated Arrow */}
        <svg
          className={`w-4 h-4 transition-all duration-300 ${isActive
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:animate-pulse'
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </>
    )}
  </NavLink>
);

export default Sidebar;
