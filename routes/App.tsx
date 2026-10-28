import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SalonLandingPage from "../pages/SalonLandingPage";
import KaycieLandingPage from "../pages/KaycieLandingPage";
// import SalonLandingPage2 from "./SalonLandingPage2";
// import SalonLandingPage3 from "./SalonLandingPage3";
import Cocreatelanding from "../pages/Cocreatelanding";
const NotFound: React.FC = () => <h1>404 - Page not found</h1>;

const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/salon" element={<SalonLandingPage />} />
      <Route path="/kaycie" element={<KaycieLandingPage/>} />
      <Route path="/co-create" element={<Cocreatelanding />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;