// import { useState } from 'react'
// import StatsDashboard from './StatsDashboard'
// import './App.css'

// function App() {
//   return (<StatsDashboard />
//   )
// }

// export default App

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layouts/dashboard/layout";

import StatsDashboard from "./StatsDashboard";
import IncidentAnalytics from "./IncidentAnalytics";
import Mail from "./Mail";
import TestPage from "./TestPage";
import "./App.css";
import ErrorLogPage from "./ErrorLogPage";
import MailManagePage from "./MailManagePage";
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
            <Route path="/" element={<StatsDashboard />} />
            {/* <Route path="/" element={<TestPage />} /> */}
            <Route path="/user" element={<UserPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/incident-analytics" element={<IncidentAnalytics />} />
            <Route path="/error-log" element={<ErrorLogPage />} />
            <Route path="/mail" element={<Mail />} />
            <Route path="/test-page" element={<TestPage />} />
            <Route path="/mail-manage" element={<MailManagePage />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </ThemeModeProvider>
  );
}

export default App;
