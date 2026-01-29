import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import LpaRequirementsSection from "./LpaRequirementsSection";
import ClientLpaInstructionsSection from "./ClientLpaInstructionsSection";
import { useAppContext } from "../../context/AppContext";

const MainLpaInstuctions = () => {
  const navigate = useNavigate();
  const { lpaInstructions, updateState } = useAppContext();
  
  const { requireLPAs = "", nominatingEachOtherAsAttorney = "" } = lpaInstructions;
  
  const handleRequireLPAsChange = (value) => {
    updateState('lpaInstructions', {
      ...lpaInstructions,
      requireLPAs: value
    });
  };

  const handleNominatingEachOtherChange = (value) => {
    updateState('lpaInstructions', {
      ...lpaInstructions,
      nominatingEachOtherAsAttorney: value
    });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-3 md:p-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FiHeart size={26} color="#0080FF" />
          <h2 className="text-[18px] md:text-[24px] font-semibold text-[#1a202c]">
            Lasting Powers of Attorney (LPA) Instructions
          </h2>
        </div>
        <p className="text-gray-500 text-sm">
          Complete the LPA requirements for each client
        </p>
      </div>

      {/* LPA Requirements Section */}
      <LpaRequirementsSection
        requireLPAs={requireLPAs}
        nominatingEachOtherAsAttorney={nominatingEachOtherAsAttorney}
        onRequireLPAsChange={handleRequireLPAsChange}
        onNominatingEachOtherChange={handleNominatingEachOtherChange}
      />

      {/* LPA Instructions for Client 1 - Shown when Yes is selected */}
      {requireLPAs === "yes" && (
        <ClientLpaInstructionsSection />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/will-instructions")}
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
        >
          <span>Previous</span>
        </button>
        <button
          onClick={() => navigate("/family-protection")}
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0080FF] text-white rounded-lg text-sm font-medium hover:bg-[#0070e6] transition-colors"
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

export default MainLpaInstuctions;
