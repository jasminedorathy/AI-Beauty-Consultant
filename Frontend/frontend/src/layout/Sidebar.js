import { NavLink } from "react-router-dom";
import {
  FaCamera,
  FaChartLine,
  FaHistory,
  FaMagic
} from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
      
      {/* Logo */}
      <div className="p-6 text-2xl font-bold text-blue-600">
        AI Beauty
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <NavItem to="/dashboard/analyze" icon={<FaMagic />} label="Analyze Image" />
        <NavItem to="/dashboard/live" icon={<FaCamera />} label="Live Camera" />
        <NavItem to="/dashboard/trends" icon={<FaChartLine />} label="Trends" />
        <NavItem to="/dashboard/history" icon={<FaHistory />} label="History" />
      </nav>

    </aside>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg transition ${
        isActive
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "text-gray-600 hover:bg-gray-100"
      }`
    }
  >
    {icon}
    {label}
  </NavLink>
);

export default Sidebar;
