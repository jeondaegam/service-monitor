// import { useState } from 'react'
// import StatsDashboard from './StatsDashboard'
// import './App.css'

// function App() {
//   return (<StatsDashboard />
//   )
// }

// export default App

import { BrowserRouter, Routes, Route } from "react-router-dom";
import StatsDashboard from "./StatsDashboard";
import { DashboardLayout } from "./layouts/dashboard/layout";
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
          <Route path="/user" element={<UserPage />} />
          <Route path="/products" element={<ProductPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;
