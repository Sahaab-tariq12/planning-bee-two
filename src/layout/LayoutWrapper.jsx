import React, { useState } from "react";
import StepTabs from "../components/StepTabs";
import QuickNavigation from "../components/QuickNavigation";
import Header from "./Header";
import FloatingBubbles from "../components/bubbles/FloatingBubbles";
import PdfExportButton from "../components/PdfExportButton";

const LayoutWrapper = ({ children }) => {
  return (
    <Header>
      <div className="flex flex-col gap-4 my-6 mx-3 h-[calc(100vh-120px)]">
        {/* Step Tabs - Yeh horizontal scroll karega agar screen choti ho */}
        <StepTabs />

        {/* Responsive Grid Layout:
           - Mobile: Flex Col (Stack)
           - Tablet (md): Sidebar 80px (Collapsed), Content Rest
           - Desktop (lg): Sidebar 380px (Expanded), Content Rest
        */}
        <div className="flex flex-col md:grid md:grid-cols-[80px_1fr] lg:grid-cols-[380px_1fr] gap-4 md:gap-8 mx-3 mt-4 h-full overflow-hidden">
          {/* Quick Navigation - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:block h-auto md:h-full overflow-y-auto scrollbar-hide flex-shrink-0 z-10">
            <QuickNavigation />
          </div>

          {/* Main Content - Scrollable Area */}
          <div
            className="h-full overflow-y-auto scrollbar-hide pb-20 md:pb-0"
            id="main-content-container"
          >
            {/* PDF Export Button - Only visible on mobile */}
            <div className="block sm:hidden mb-4">
              <PdfExportButton className="w-full" />
            </div>
            
            {/* PDF Export Button - Also visible on small tablets */}
            <div className="hidden sm:block md:hidden mb-4">
              <PdfExportButton className="w-full" />
            </div>
            
            {children}
          </div>
        </div>
      </div>
      <FloatingBubbles />
    </Header>
  );
};
export default LayoutWrapper;
