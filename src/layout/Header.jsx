import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiFileText, FiPlus, FiPlusSquare } from "react-icons/fi";

const ROUTE_STEPS = [
  { path: "/client-details", step: 1 },
  { path: "/will-instructions", step: 2 },
  { path: "/lpa-instructions", step: 3 },
  { path: "/family-protection", step: 4 },
  { path: "/id-information", step: 5 },
  { path: "/review", step: 6 },
];

const TOTAL_STEPS = 6;

const Header = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const currentStep = useMemo(() => {
    const route = ROUTE_STEPS.find((route) => route.path === location.pathname);
    return route ? route.step : 0;
  }, [location.pathname]);

  return (
    <>
      <div className="fixed bg-[#30353E] w-full h-20 sm:h-24 top-0 left-0 right-0 flex justify-between items-center px-4 sm:px-6 border-b-2 border-[#0080FF] z-50">
        {/* Left Side */}
        <div className="flex gap-3 items-center">
          <div className="bg-[#0080FF] w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg">
            {isHome ? (
              <FiFileText size={20} color="white" className="w-5 h-5"/>
            ) : (
              <FiPlusSquare size={20} color="white" className="w-5 h-5"/>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[16px] md:text-[24px] font-bold text-[#0080FF] leading-tight">
              The Planning Bee
            </p>
            <p className="hidden sm:block text-[14px] text-[#0080FF]">
              Professional Estate Planning Solutions
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 sm:gap-6">
          {isHome ? (
            <button
              onClick={() => navigate("/client-details")}
              className="bg-[#0080FF] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg flex items-center gap-2 shadow-md hover:bg-[#0070e6] transition-all"
            >
              <FiPlus size={18} strokeWidth={3} />
              <span className="hidden sm:inline font-semibold">
                New Application
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[#0080FF] font-bold text-lg">
                  New Application
                </span>
                <span className="text-gray-400 text-sm">In Progress</span>
              </div>

              {currentStep > 0 && (
                <div className="bg-[#0080FF] text-white px-4 sm:px-5 py-2 rounded-full font-bold shadow-lg text-[12px] md:text-base">
                  Step {currentStep} of {TOTAL_STEPS}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 sm:pt-24">{children}</div>
    </>
  );
};

export default Header;
