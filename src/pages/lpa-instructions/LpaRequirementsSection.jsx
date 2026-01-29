import React from "react";

const LpaRequirementsSection = ({ 
  requireLPAs, 
  nominatingEachOtherAsAttorney,
  onRequireLPAsChange, 
  onNominatingEachOtherChange 
}) => {
  const handleRequireLPAsRadioChange = (value) => {
    if (onRequireLPAsChange) {
      onRequireLPAsChange(value);
    }
  };

  const handleNominatingEachOtherRadioChange = (value) => {
    if (onNominatingEachOtherChange) {
      onNominatingEachOtherChange(value);
    }
  };

  return (
    <div className="bg-[#FEF9E7] rounded-lg border border-[#F7DC6F] p-3 md:p-6 flex flex-col gap-2 md:gap-4">
      <h3 className="text-lg font-bold text-[#2D3748]">LPA Requirements</h3>

      <div className="space-y-3">
        <p className="text-[#2D3748] font-medium">Do client(s) require LPAs?</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="requireLPAs"
              className="w-3 h-3 md:w-4 md:h-4"
              checked={requireLPAs === "yes"}
              onChange={() => handleRequireLPAsRadioChange("yes")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="requireLPAs"
              className="w-3 h-3 md:w-4 md:h-4"
              checked={requireLPAs === "no"}
              onChange={() => handleRequireLPAsRadioChange("no")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
          </label>
        </div>
      </div>

      {/* New question - only show if LPAs are required */}
      {requireLPAs === "yes" && (
        <div className="space-y-3 mt-4">
          <p className="text-[#2D3748] font-medium">Are the clients nominating each other as attorney?</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nominatingEachOtherAsAttorney"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={nominatingEachOtherAsAttorney === "yes"}
                onChange={() => handleNominatingEachOtherRadioChange("yes")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="nominatingEachOtherAsAttorney"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={nominatingEachOtherAsAttorney === "no"}
                onChange={() => handleNominatingEachOtherRadioChange("no")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default LpaRequirementsSection;
