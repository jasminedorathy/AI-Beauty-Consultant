
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./auth/Login";
import Signup from "./auth/Signup";

import AnalyzePage from "./features/analysis/AnalyzePage";
import HistoryPage from "./features/history/HistoryPage";
import TrendsPage from "./features/history/TrendsPage";

import LiveAnalyzePage from "./features/camera/LiveAnalyzePage";
import HairStyling from "./features/styling/HairStyling";
import NailStyling from "./features/styling/NailStyling";
import ServicesPage from "./features/services/ServicesPage";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default */}
        <Route path="/" element={<Navigate to="/signup" />} />

        {/* Public */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AnalyzePage />} />
          <Route path="analyze" element={<AnalyzePage />} />
          <Route path="live" element={<LiveAnalyzePage />} />
          <Route path="hair" element={<HairStyling />} />
          <Route path="nails" element={<NailStyling />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="trends" element={<TrendsPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

