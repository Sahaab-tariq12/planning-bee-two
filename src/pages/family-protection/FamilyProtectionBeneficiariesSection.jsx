import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";
import BeneficiaryGroupForm from "./BeneficiaryGroupForm";

// Helper functions
const createInitialGroup = () => ({
  id: Date.now().toString(),
  percentage: "",
  type: "",
  beneficiaries: [{
    id: `beneficiary-${Date.now()}`,
    title: "",
    name: "",
    relationship: "",
    address: "",
    classGift: "",
    ageOfVesting: "",
    selectedPerson: "",
  }],
  goc: {
    giftOverToChildren: false,
    accruer: false,
    otherEntities: false,
  },
  furtherDetails: "",
});

const removeItemFromArray = (array, id) => 
  array.filter(item => item.id !== id);

const updateItemInArray = (array, id, updater) => {
  return array.map(item => item.id === id ? updater(item) : item);
};

const FamilyProtectionBeneficiariesSection = () => {
  const { familyProtection, updateState } = useAppContext();
  const { beneficiarySetup = "", beneficiaryGroups = [] } = familyProtection;

  // Calculate total percentage
  const totalPercentage = beneficiaryGroups.reduce(
    (sum, group) => sum + (parseFloat(group.percentage) || 0),
    0
  );

  const updateFamilyProtection = (updates) => {
    updateState('familyProtection', {
      ...familyProtection,
      ...updates
    });
  };

  const handleBeneficiarySetupChange = (value) => {
    if (value === 'other' && (!beneficiaryGroups || beneficiaryGroups.length === 0)) {
      // Add an initial group when selecting 'other' for the first time
      updateFamilyProtection({
        beneficiarySetup: value,
        beneficiaryGroups: [createInitialGroup()]
      });
    } else {
      updateFamilyProtection({ beneficiarySetup: value });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-[14px] md:text-lg font-bold text-[#2D3748]">Trust Beneficiaries</h3>
        <p className="text-gray-500 text-xs md:text-sm">
          Define percentage-based distribution for trust beneficiaries
        </p>
      </div>
      <div className="space-y-4">
        <p className="text-[#2D3748] text-[14px] md:text-[16px] font-medium">
          How would you like to set up trust beneficiaries?
        </p>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="beneficiarySetup"
              className="w-3 h-3 md:w-4 md:h-4 mt-3 md:mt-1"
              checked={beneficiarySetup === "same"}
              onChange={() => handleBeneficiarySetupChange("same")}
            />
            <div className="flex flex-col">
              <span className="text-gray-700 text-[14px] md:text-[16px] font-medium">Same as Will Residue</span>
              <span className="text-gray-500 text-xs md:text-sm">
                Copy the exact residue structure from the will instructions
              </span>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name="beneficiarySetup"
              className="w-3 h-3 md:w-4 md:h-4 mt-1"
              checked={beneficiarySetup === "other"}
              onChange={() => handleBeneficiarySetupChange("other")}
            />
            <div className="flex flex-col">
              <span className="text-gray-700 text-[14px] md:text-[16px] font-medium">Other</span>
              <span className="text-gray-500 text-xs md:text-sm">
                Create custom percentage groups for trust beneficiaries
              </span>
            </div>
          </label>
        </div>
        {beneficiarySetup === "other" && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <p className="text-blue-700 text-xs md:text-sm">
                Add percentage groups that total 100%. Within each percentage, add
                multiple beneficiaries.
              </p>
              <p className="text-blue-700 font-bold text-xs md:text-sm mt-2">
                Current Total: {totalPercentage}%
                {totalPercentage !== 100 && (
                  <span className="text-red-500 ml-2">
                    ({100 - totalPercentage}% remaining)
                  </span>
                )}
              </p>
            </div>

            {/* Beneficiary Groups */}
            <div className="space-y-4">
              {beneficiaryGroups.map((group, index) => (
                <BeneficiaryGroupForm
                  key={group.id}
                  group={group}
                  index={index}
                  totalPercentage={totalPercentage}
                  onGroupChange={(groupId, field, value) => {
                    const updatedGroups = updateItemInArray(
                      beneficiaryGroups,
                      groupId,
                      group => ({
                        ...group,
                        [field]: value
                      })
                    );
                    updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                  }}
                  onRemoveGroup={(groupId) => {
                    const updatedGroups = removeItemFromArray(beneficiaryGroups, groupId);
                    updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                  }}
                  onAddBeneficiary={(groupId) => {
                    const updatedGroups = updateItemInArray(
                      beneficiaryGroups,
                      groupId,
                      group => ({
                        ...group,
                        beneficiaries: [
                          ...group.beneficiaries,
                          {
                            id: `beneficiary-${Date.now()}`,
                            title: "",
                            name: "",
                            relationship: "",
                            address: "",
                            classGift: "",
                            ageOfVesting: "",
                            selectedPerson: "",
                          }
                        ]
                      })
                    );
                    updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                  }}
                  onRemoveBeneficiary={(groupId, beneficiaryId) => {
                    const updatedGroups = updateItemInArray(
                      beneficiaryGroups,
                      groupId,
                      group => ({
                        ...group,
                        beneficiaries: removeItemFromArray(group.beneficiaries, beneficiaryId)
                      })
                    );
                    updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                  }}
                  onBeneficiaryChange={(groupId, beneficiaryId, field, value) => {
                    console.log("=== BENEFICIARY CHANGE DEBUG ===");
                    console.log("groupId:", groupId);
                    console.log("beneficiaryId:", beneficiaryId);
                    console.log("field:", field);
                    console.log("value:", value);
                    console.log("typeof value:", typeof value);
                    
                    // Handle updating entire beneficiary object
                    if (field === 'update' && value) {
                      console.log("Handling entire beneficiary object update");
                      const updatedGroups = updateItemInArray(
                        beneficiaryGroups,
                        groupId,
                        group => ({
                          ...group,
                          beneficiaries: updateItemInArray(
                            group.beneficiaries,
                            beneficiaryId,
                            beneficiary => value
                          )
                        })
                      );
                      console.log("Updated groups:", updatedGroups);
                      updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                      return;
                    }
                    
                    if (typeof value === 'object') {
                      // Handle entire beneficiary object update (like from dropdown selection)
                      console.log("Handling entire beneficiary object update");
                      const updatedGroups = updateItemInArray(
                        beneficiaryGroups,
                        groupId,
                        group => ({
                          ...group,
                          beneficiaries: updateItemInArray(
                            group.beneficiaries,
                            beneficiaryId,
                            beneficiary => value
                          )
                        })
                      );
                      console.log("Updated groups:", updatedGroups);
                      updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                    } else {
                      // Handle single field update
                      console.log("Handling single field update");
                      const updatedGroups = updateItemInArray(
                        beneficiaryGroups,
                        groupId,
                        group => ({
                          ...group,
                          beneficiaries: updateItemInArray(
                            group.beneficiaries,
                            beneficiaryId,
                            beneficiary => ({
                              ...beneficiary,
                              [field]: value
                            })
                          )
                        })
                      );
                      console.log("Updated groups:", updatedGroups);
                      updateFamilyProtection({ beneficiaryGroups: updatedGroups });
                    }
                  }}
                />
              ))}

              <button
                type="button"
                onClick={() => {
                  updateFamilyProtection({
                    beneficiaryGroups: [...beneficiaryGroups, createInitialGroup()]
                  });
                }}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <FiPlus size={18} /> Add Another Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyProtectionBeneficiariesSection;
