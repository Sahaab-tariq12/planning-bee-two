import React from "react";
import { useAppContext } from "../../context/AppContext";

const FamilyProtectionAdditionalInfo = () => {
  const { familyProtection, updateState } = useAppContext();
  const {
    disabledBeneficiaries = false,
    potentialClaims = false,
    mainResidence = false,
    mortgageOrEquity = false,
    rx1OrTr1 = "",
    trustReasons = {
      reduceProbate: false,
      sidewaysDisinheritance: false,
      divorceClaims: false,
      generationalIHT: false,
      claimsAgainstEstate: false,
    },
  } = familyProtection;

  const updateFamilyProtection = (updates) => {
    updateState("familyProtection", {
      ...familyProtection,
      ...updates,
    });
  };

  const handleCheckboxChange = (field, value) => {
    updateFamilyProtection({ [field]: value });
  };

  const handleRadioChange = (value) => {
    updateFamilyProtection({ rx1OrTr1: value });
  };

  const handleTrustReasonChange = (field) => {
    const updatedReasons = {
      ...trustReasons,
      [field]: !trustReasons[field],
    };
    updateFamilyProtection({ trustReasons: updatedReasons });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-4">
      <h3 className="text-[14px] md:text-lg font-bold text-[#2D3748]">
        Additional Trust Information
      </h3>
      <div className="space-y-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3 h-3 md:w-4 md:h-4"
            checked={disabledBeneficiaries}
            onChange={(e) =>
              handleCheckboxChange("disabledBeneficiaries", e.target.checked)
            }
          />
          <span className="text-gray-700 text-[14px] md:text-[16px]">
            Are any of the beneficiaries disabled or vulnerable?
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3 h-3 md:w-4 md:h-4"
            checked={potentialClaims}
            onChange={(e) =>
              handleCheckboxChange("potentialClaims", e.target.checked)
            }
          />
          <span className="text-gray-700">
            Are there any people who may have potential claims on the estate?
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3 h-3 md:w-4 md:h-4"
            checked={mainResidence}
            onChange={(e) =>
              handleCheckboxChange("mainResidence", e.target.checked)
            }
          />
          <span className="text-gray-700 text-[14px] md:text-[16px]">
            Is the main residence being settled into trust?
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={mortgageOrEquity}
            onChange={(e) =>
              handleCheckboxChange("mortgageOrEquity", e.target.checked)
            }
          />
          <span className="text-gray-700 text-[14px] md:text-[16px]">
            Is there a mortgage or equity release?
          </span>
        </label>
        <div className="space-y-3">
          <p className="text-[#2D3748] font-medium">
            Is an RX1 (no probate benefit) or TR1 required?
          </p>
          <div className="flex flex-col md:flex-row gap-1 md:gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rx1OrTr1"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={rx1OrTr1 === "rx1"}
                onChange={() => handleRadioChange("rx1")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                RX1 (no probate benefit)
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rx1OrTr1"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={rx1OrTr1 === "tr1"}
                onChange={() => handleRadioChange("tr1")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                TR1
              </span>
            </label>
          </div>
        </div>
        <div className="space-y-3 mt-4">
          <h4 className="text-[#2D3748] font-semibold">
            Reasons for establishing the trust (select all that apply)
          </h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trustReasons.reduceProbate}
                onChange={() => handleTrustReasonChange("reduceProbate")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                To reduce time and costs associated with probate
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trustReasons.sidewaysDisinheritance}
                onChange={() =>
                  handleTrustReasonChange("sidewaysDisinheritance")
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                To protect from sideways disinheritance
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trustReasons.divorceClaims}
                onChange={() => handleTrustReasonChange("divorceClaims")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                To protect beneficiaries from divorce claims
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trustReasons.generationalIHT}
                onChange={() => handleTrustReasonChange("generationalIHT")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                To protect beneficiaries from generational IHT
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trustReasons.claimsAgainstEstate}
                onChange={() => handleTrustReasonChange("claimsAgainstEstate")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">
                To protect from claims against the estate (i.e. disinherited
                children)
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyProtectionAdditionalInfo;
