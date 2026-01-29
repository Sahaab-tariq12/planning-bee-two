import React from "react";
import { useNavigate } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import FamilyProtectionTrustContent from "./FamilyProtectionTrustContent";
import { useAppContext } from "../../context/AppContext";

const MainFamilyProtection = () => {
  const navigate = useNavigate();
  const { familyProtection, updateState } = useAppContext();
  const { requireTrust = "" } = familyProtection;

  const handleRadioChange = (value) => {
    updateState('familyProtection', {
      ...familyProtection,
      requireTrust: value
    });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FiShield size={26} color="#0080FF" />
          <h2 className="text-[18px] md:text-[24px] font-semibold text-[#1a202c]">
            Family Protection Trust Instructions
          </h2>
        </div>
        <p className="text-gray-500 text-xs md:text-sm">
          Set up trust arrangements and specify trustees and beneficiaries
        </p>
      </div>

      {/* Family Protection Trust Requirements Section */}
      <div className="bg-[#FEF9E7] rounded-lg border border-[#F7DC6F] p-3 md:p-6 flex flex-col gap-4">
        <h3 className="text-[14px] md:text-lg font-bold text-[#2D3748]">
          Family Protection Trust Requirements
        </h3>

        <div className="space-y-3">
          <p className="text-[#2D3748] text-[14px] md:text-[16px] font-medium">
            Do client(s) require a Family Protection Trust?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="requireTrust"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={requireTrust === "yes"}
                onChange={() => handleRadioChange("yes")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="requireTrust"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={requireTrust === "no"}
                onChange={() => handleRadioChange("no")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Expanded Content - Shown when Yes is selected */}
      {requireTrust === "yes" && <FamilyProtectionTrustContent />}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => navigate("/lpa-instructions")}
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
        >
          <span>Previous</span>
        </button>
        <button
          onClick={() => navigate("/id-information")}
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0080FF] text-white rounded-lg text-sm font-medium hover:bg-[#0070e6] transition-colors"
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  );
};

export default MainFamilyProtection;
