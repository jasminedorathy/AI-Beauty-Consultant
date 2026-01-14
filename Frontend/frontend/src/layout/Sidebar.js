import { NavLink } from "react-router-dom";
import {
  FaCamera,
  FaChartLine,
  FaHistory,
  FaMagic,
  FaCut,
  FaPaintBrush,
  FaUserCircle
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-72 bg-white shadow-2xl hidden md:flex flex-col z-20 font-sans">

      {/* Brand Logo */}
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
          AI Beauty<span className="text-sm font-normal text-gray-400 block tracking-wide mt-1">Consultant</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-2">
          Analysis
        </div>
        <NavItem to="/dashboard/analyze" icon={<FaMagic />} label="Face Analysis" />
        <NavItem to="/dashboard/live" icon={<FaCamera />} label="Live Camera" />

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
          Styling Studio
        </div>
        <NavItem to="/dashboard/hair" icon={<FaCut />} label="Hair Styling" badge="NEW" />
        <NavItem to="/dashboard/nails" icon={<FaPaintBrush />} label="Nail Studio" badge="NEW" />

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
          Insights
        </div>
        <NavItem to="/dashboard/trends" icon={<FaChartLine />} label="Skin Trends" />
        <NavItem to="/dashboard/history" icon={<FaHistory />} label="History" />
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-2 text-white">
          <FaUserCircle size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700">Welcome User</p>
          <p className="text-xs text-gray-500">Free Plan</p>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${isActive
        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-bold shadow-sm translate-x-1"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Active Indicator Line */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-lg" />
        )}

        <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}>
          {icon}
        </span>

        <span className="flex-1">{label}</span>

        {/* NEW Badge */}
        {badge && (
          <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
            {badge}
          </span>
        )}
      </>
    )}
  </NavLink>
);

export default Sidebar;
