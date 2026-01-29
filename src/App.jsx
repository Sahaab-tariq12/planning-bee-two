import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import LayoutWrapper from "./layout/LayoutWrapper";
import MainHomePage from "./pages/home/MainHomePage";
import MainClientDetails from "./pages/client-details/MainClientDetails";
import MainWillInstructions from "./pages/will-instructions/MainWillInstructions";
import MainLpaInstuctions from "./pages/lpa-instructions/MainLpaInstuctions";
import MainFamilyProtection from "./pages/family-protection/MainFamilyProtection";
import MainIdInformation from "./pages/id-information/MainIdInformation";
import MainReview from "./pages/review-sign/MainReview";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  const location = useLocation();

  return (
    <AppProvider>
      <Toaster position="top-right" />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<MainHomePage />} />

        <Route
          path="/client-details"
          element={
            <LayoutWrapper>
              <MainClientDetails />
            </LayoutWrapper>
          }
        />
        <Route
          path="/will-instructions"
          element={
            <LayoutWrapper>
              <MainWillInstructions />
            </LayoutWrapper>
          }
        />
        <Route
          path="/lpa-instructions"
          element={
            <LayoutWrapper>
              <MainLpaInstuctions />
            </LayoutWrapper>
          }
        />
        <Route
          path="/family-protection"
          element={
            <LayoutWrapper>
              <MainFamilyProtection />
            </LayoutWrapper>
          }
        />
        <Route
          path="/id-information"
          element={
            <LayoutWrapper>
              <MainIdInformation />
            </LayoutWrapper>
          }
        />
        <Route
          path="/review"
          element={
            <LayoutWrapper>
              <MainReview />
            </LayoutWrapper>
          }
        />
      </Routes>
    </AppProvider>
  );
};

export default App;
