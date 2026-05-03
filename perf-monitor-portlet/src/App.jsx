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
import ErrorLogs from "./ErrorLogs";
import Mail from "./Mail";
import TestPage from "./TestPage";
import "./App.css";

function UserPage() {
  return <h1>User</h1>;
}

function ProductPage() {
  return <h1>Product</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<StatsDashboard />} />
          {/* <Route path="/" element={<TestPage />} /> */}
          <Route path="/user" element={<UserPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/incidentAnalytics" element={<IncidentAnalytics />} />
          <Route path="/errorLogs" element={<ErrorLogs />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/testPage" element={<TestPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
