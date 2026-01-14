import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import ConsultantChat from "../features/chat/ConsultantChat";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 relative">

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* AI Chatbot Widget - Floats on top */}
      <ConsultantChat />

    </div>
  );
};

export default DashboardLayout;
