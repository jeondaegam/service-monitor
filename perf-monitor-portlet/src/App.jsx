import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard/layout";

import MonitoringDashboard from "./pages/MonitoringDashboard/MonitoringDashboard";
import IncidentStats from "./pages/IncidentStats/IncidentStats";
import Mail from "./pages/Mail";
import TestPage from "./pages/TestPage";
import "./style/App.css";
import ErrorLogPage from "./pages/ErrorLog/ErrorLogPage";
import Notifications from "./pages/Notifications/Notifications";
import { ThemeModeProvider } from "./theme-mode";

function UserPage() {
  return <h1>User</h1>;
}

function ProductPage() {
  return <h1>Product</h1>;
}

function App() {
  return (
    <ThemeModeProvider>
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<MonitoringDashboard />} />
            {/* <Route path="/" element={<TestPage />} /> */}
            {/* <Route path="/user" element={<UserPage />} /> */}
            {/* <Route path="/products" element={<ProductPage />} /> */}
            <Route path="/incident-stats" element={<IncidentStats />} />
            <Route path="/error-log" element={<ErrorLogPage />} />
            {/* <Route path="/mail" element={<Mail />} /> */}
            {/* <Route path="/test-page" element={<TestPage />} /> */}
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </ThemeModeProvider>
  );
}

export default App;
