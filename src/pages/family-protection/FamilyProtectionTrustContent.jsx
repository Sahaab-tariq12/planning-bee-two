import React from "react";
import Input from "../../components/Input";
import FamilyProtectionAdditionalInfo from "./FamilyProtectionAdditionalInfo";
import FamilyProtectionTrusteesSection from "./FamilyProtectionTrusteesSection";
import FamilyProtectionBeneficiariesSection from "./FamilyProtectionBeneficiariesSection";
import { useAppContext } from "../../context/AppContext";

const FamilyProtectionTrustContent = () => {
  const { familyProtection, updateState } = useAppContext();
  const {
    client1NI = "",
    client2NI = "",
    settlors = {
      client1: false,
      client2: false,
      both: false,
    },
    additionalInfo = "",
  } = familyProtection;

  const updateFamilyProtection = (updates) => {
    updateState("familyProtection", {
      ...familyProtection,
      ...updates,
    });
  };

  const handleClient1NIChange = (e) => {
    updateFamilyProtection({ client1NI: e.target.value });
  };

  const handleClient2NIChange = (e) => {
    updateFamilyProtection({ client2NI: e.target.value });
  };

  const handleSettlorChange = (field) => {
    const updatedSettlors = {
      ...settlors,
      [field]: !settlors[field],
    };

    // If 'both' is selected, update client1 and client2 accordingly
    if (field === "both") {
      updatedSettlors.client1 = updatedSettlors.both;
      updatedSettlors.client2 = updatedSettlors.both;
    } else if (field === "client1" || field === "client2") {
      // If both client1 and client2 are checked, also check 'both'
      updatedSettlors.both = updatedSettlors.client1 && updatedSettlors.client2;
    }

    updateFamilyProtection({ settlors: updatedSettlors });
  };

  const handleAdditionalInfoChange = (e) => {
    updateFamilyProtection({ additionalInfo: e.target.value });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* National Insurance Numbers Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-4">
        <h3 className="text-[13px] md:text-lg font-bold text-[#2D3748]">
          National Insurance Numbers
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Client 1 National Insurance Number"
            type="text"
            value={client1NI}
            onChange={handleClient1NIChange}
            placeholder="AB123456C"
          />
          <Input
            label="Client 2 National Insurance Number"
            type="text"
            value={client2NI}
            onChange={handleClient2NIChange}
            placeholder="AB123456C"
          />
        </div>
      </div>

      {/* Who are the settlors? Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-4">
        <p className="text-[14px] md:text-lg font-bold text-[#2D3748]">
          Who are the settlors?
        </p>
        <div className="flex flex-col md:flex-row gap-2 md:gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4"
              checked={settlors.client1}
              onChange={() => handleSettlorChange("client1")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Client 1</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4"
              checked={settlors.client2}
              onChange={() => handleSettlorChange("client2")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Client 2</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4"
              checked={settlors.both}
              onChange={() => handleSettlorChange("both")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Both</span>
          </label>
        </div>
      </div>

      <FamilyProtectionTrusteesSection />

      <FamilyProtectionBeneficiariesSection />

      {/* Additional Trust Information Section */}
      <FamilyProtectionAdditionalInfo />

      {/* Additional Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-4">
        <h3 className="text-[14px] md:text-lg font-bold text-[#2D3748]">
          Additional information
        </h3>
        <Input
          type="textarea"
          value={additionalInfo}
          onChange={handleAdditionalInfoChange}
          placeholder="Any additional notes or information about the trust..."
          rows={4}
          maxLength={500}
        />
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-gray-500">
            {additionalInfo.length}/500 characters
          </span>
        </div>
      </div>
    </div>
  );
};

export default FamilyProtectionTrustContent;
