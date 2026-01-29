import React, { useState, useEffect, useRef } from "react";
import { FiPlus } from "react-icons/fi";
import ResiduePercentageGroupForm from "./ResiduePercentageGroupForm";
import { createInitialGroup, createInitialBeneficiary, calculateTotal } from "../../constants/ResidueConstants";
import { useAppContext } from "../../context/AppContext";

const removeItemFromArray = (array, id) => 
  array.filter(item => item.id !== id);

const updateItemInArray = (array, id, updater) => {
  return array.map(item => item.id === id ? updater(item) : item);
};

const Residue = () => {
  const { willInstructions, updateState } = useAppContext();
  
  // Initialize state from context or use defaults
  const [spousalEstateTransfer, setSpousalEstateTransfer] = useState(() =>
    willInstructions.residue?.spousalEstateTransfer || ""
  );
  const [percentageGroups, setPercentageGroups] = useState(() =>
    willInstructions.residue?.percentageGroups || []
  );
  const [hasSubstitutionalProvisions, setHasSubstitutionalProvisions] = useState(() =>
    willInstructions.residue?.hasSubstitutionalProvisions || false
  );
  const [alternateGroups, setAlternateGroups] = useState(() =>
    willInstructions.residue?.alternateGroups || []
  );

  const prevResidueData = useRef(JSON.stringify({
    spousalEstateTransfer,
    percentageGroups,
    hasSubstitutionalProvisions,
    alternateGroups
  }));

  // Update context when state changes (only if actually different)
  useEffect(() => {
    const currentResidueData = JSON.stringify({
      spousalEstateTransfer,
      percentageGroups,
      hasSubstitutionalProvisions,
      alternateGroups
    });

    // Only update if the data actually changed
    if (currentResidueData !== prevResidueData.current) {
      prevResidueData.current = currentResidueData;
      updateState('willInstructions', {
        ...willInstructions,
        residue: {
          spousalEstateTransfer,
          percentageGroups,
          hasSubstitutionalProvisions,
          alternateGroups
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spousalEstateTransfer, percentageGroups, hasSubstitutionalProvisions, alternateGroups]);

  // Group Management
  const addGroup = (groups, setGroups) => {
    setGroups([...groups, createInitialGroup()]);
  };

  const removeGroup = (id, groups, setGroups) => {
    setGroups(removeItemFromArray(groups, id));
  };

  const updateGroup = (id, field, value, groups, setGroups) => {
    setGroups(updateItemInArray(groups, id, group => ({
      ...group,
      [field]: value
    })));
  };

  // GOC (Gift Over Clause) Management
  const updateGOC = (id, field, groups, setGroups) => {
    setGroups(updateItemInArray(groups, id, group => ({
      ...group,
      goc: {
        ...group.goc,
        [field]: !group.goc[field]
      }
    })));
  };

  // Beneficiary Management
  const addBeneficiary = (groupId, groups, setGroups) => {
    setGroups(updateItemInArray(groups, groupId, group => ({
      ...group,
      beneficiaries: [...group.beneficiaries, createInitialBeneficiary()]
    })));
  };

  const removeBeneficiary = (groupId, beneficiaryId, groups, setGroups) => {
    setGroups(updateItemInArray(groups, groupId, group => ({
      ...group,
      beneficiaries: removeItemFromArray(group.beneficiaries, beneficiaryId)
    })));
  };

  const updateBeneficiary = (groupId, beneficiaryId, field, value, groups, setGroups) => {
    setGroups(updateItemInArray(groups, groupId, group => ({
      ...group,
      beneficiaries: updateItemInArray(group.beneficiaries, beneficiaryId, beneficiary => ({
        ...beneficiary,
        [field]: value
      }))
    })));
  };

  // Update entire beneficiary object at once (like ExecutorForm)
  const updateEntireBeneficiary = (groupId, beneficiaryId, updatedBeneficiary, groups, setGroups) => {
    setGroups(updateItemInArray(groups, groupId, group => ({
      ...group,
      beneficiaries: updateItemInArray(group.beneficiaries, beneficiaryId, beneficiary => ({
        ...beneficiary,
        ...updatedBeneficiary
      }))
    })));
  };

  // Wrapper functions for percentage groups
  const handleAddPercentageGroup = () => addGroup(percentageGroups, setPercentageGroups);
  const handleRemovePercentageGroup = (id) => removeGroup(id, percentageGroups, setPercentageGroups);
  const handleGroupChange = (id, field, value) => updateGroup(id, field, value, percentageGroups, setPercentageGroups);
  const handleGOCChange = (id, field) => updateGOC(id, field, percentageGroups, setPercentageGroups);
  const handleAddBeneficiary = (groupId) => addBeneficiary(groupId, percentageGroups, setPercentageGroups);
  const handleRemoveBeneficiary = (groupId, beneficiaryId) => 
    removeBeneficiary(groupId, beneficiaryId, percentageGroups, setPercentageGroups);
  const handleBeneficiaryChange = (groupId, beneficiaryId, field, value) => 
    updateBeneficiary(groupId, beneficiaryId, field, value, percentageGroups, setPercentageGroups);
  const handleEntireBeneficiaryChange = (groupId, beneficiaryId, updatedBeneficiary) => 
    updateEntireBeneficiary(groupId, beneficiaryId, updatedBeneficiary, percentageGroups, setPercentageGroups);

  // Wrapper functions for alternate groups
  const handleAddAlternateGroup = () => addGroup(alternateGroups, setAlternateGroups);
  const handleRemoveAlternateGroup = (id) => removeGroup(id, alternateGroups, setAlternateGroups);
  const handleAlternateGroupChange = (id, field, value) => 
    updateGroup(id, field, value, alternateGroups, setAlternateGroups);

  // Wrapper functions for alternate groups
  const handleAlternateGOCChange = (id, field) => updateGOC(id, field, alternateGroups, setAlternateGroups);
  const handleAddAlternateBeneficiary = (groupId) => addBeneficiary(groupId, alternateGroups, setAlternateGroups);
  const handleRemoveAlternateBeneficiary = (groupId, beneficiaryId) => 
    removeBeneficiary(groupId, beneficiaryId, alternateGroups, setAlternateGroups);
  const handleAlternateBeneficiaryChange = (groupId, beneficiaryId, field, value) => 
    updateBeneficiary(groupId, beneficiaryId, field, value, alternateGroups, setAlternateGroups);
  const handleAlternateEntireBeneficiaryChange = (groupId, beneficiaryId, updatedBeneficiary) => 
    updateEntireBeneficiary(groupId, beneficiaryId, updatedBeneficiary, alternateGroups, setAlternateGroups);

  const currentTotal = calculateTotal(percentageGroups);
  const alternateTotal = calculateTotal(alternateGroups);

  return (
    <div className="bg-[#F7F9FB] rounded-xl border border-gray-200 p-3 md:p-6 flex flex-col gap-3 md:gap-6">
      {/* Header */}
      <div>
        <h3 className="text-[15px] md:text-xl font-bold text-[#2D3748]">
          Residue (Estate Distribution)
        </h3>
      </div>

      {/* Spousal Estate Transfer Question */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Do the clients leave their estate to each other?
        </p>
        <div className="flex flex-col md:flex-row gap-1 md:gap-6">
          {["Yes", "No", "FLIT", "N/A"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="spousalEstateTransfer"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={spousalEstateTransfer === option.toLowerCase()}
                onChange={() =>
                  setSpousalEstateTransfer(option.toLowerCase())
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Estate Distribution by Percentage Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-0 md:gap-4">
        <div>
          <h4 className="text-[14px] md:text-lg font-semibold text-[#1a202c] mb-2">
            Estate Distribution by Percentage
          </h4>
          <p className="text-xs md:text-sm text-[#0080FF] mb-3">
            Add percentage groups that total 100%. Within each percentage, add
            multiple beneficiaries.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-medium text-gray-700">
              Current Total:
            </span>
            <span className="text-xs md:text-sm font-semibold text-[#0080FF]">
              {currentTotal}%
            </span>
          </div>
        </div>

        {percentageGroups.length === 0 ? (
          <>
            <div className="mt-4 py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center text-gray-500 text-sm">
              No percentage groups defined yet. Click the button below to start distributing the estate.
            </div>
            <button
              type="button"
              onClick={handleAddPercentageGroup}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm mt-4"
            >
              <FiPlus size={18} />
              Add Percentage Group
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {percentageGroups.map((group, index) => (
              <ResiduePercentageGroupForm
                key={group.id}
                group={group}
                index={index}
                onRemove={handleRemovePercentageGroup}
                onGroupChange={handleGroupChange}
                onGOCChange={handleGOCChange}
                onAddBeneficiary={handleAddBeneficiary}
                onRemoveBeneficiary={handleRemoveBeneficiary}
                onBeneficiaryChange={handleBeneficiaryChange}
                onEntireBeneficiaryChange={handleEntireBeneficiaryChange}
              />
            ))}
            <div className="mt-2">
              <button
                type="button"
                onClick={handleAddPercentageGroup}
                className="w-full inline-flex items-center justify-center gap-2 md:px-4 py-3 border border-gray-300 rounded-lg text-[10px] md:text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FiPlus size={16} />
                Add Another Percentage Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Substitutional Provisions Section */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={hasSubstitutionalProvisions}
            onChange={(e) => setHasSubstitutionalProvisions(e.target.checked)}
          />
          <div>
            <p className="font-semibold text-[14px] md:text-[16px] text-[#1a202c]">
              Substitutional provisions (in the event of a complete failure of
              above)
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Create an alternate residue section if all gifts above fail
              completely
            </p>
          </div>
        </label>
      </div>

      {/* Alternate Estate Distribution Section */}
      {hasSubstitutionalProvisions && (
        <div className="bg-[#FFF4E6] rounded-lg border border-[#FFE8CC] p-3 md:p-6 flex flex-col gap-4">
          <div>
            <h4 className="text-[14px] md:text-lg font-semibold text-[#8B4513] mb-2">
              Alternate Estate Distribution
            </h4>
            <p className="text-xs md:text-sm text-[#A0522D] mb-3">
              This alternate distribution will apply if the main distribution
              fails completely.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-gray-700">
                Alternate Total:
              </span>
              <span className="text-sm font-semibold text-[#D2691E]">
                {alternateTotal}%
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddAlternateGroup}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#D2691E] rounded-lg text-xs md:text-sm font-medium text-[#8B4513] bg-white hover:bg-[#FFF4E6] transition-colors shadow-sm"
            >
              <FiPlus size={16} />
              Add Alternate Group
            </button>
          </div>

          {alternateGroups.length === 0 ? (
            <div className="mt-4 py-10 px-4 bg-white rounded-lg border border-dashed border-[#FFE8CC] text-center text-[#A0522D] text-sm">
              No alternate percentage groups defined yet. Click{" "}
              <span className="font-semibold">"Add Alternate Group"</span> to
              start defining the alternate distribution.
            </div>
          ) : (
            <div className="space-y-4">
              {alternateGroups.map((group, index) => (
                <ResiduePercentageGroupForm
                  key={group.id}
                  group={group}
                  index={index}
                  onRemove={handleRemoveAlternateGroup}
                  onGroupChange={handleAlternateGroupChange}
                  onGOCChange={handleAlternateGOCChange}
                  onAddBeneficiary={handleAddAlternateBeneficiary}
                  onRemoveBeneficiary={handleRemoveAlternateBeneficiary}
                  onBeneficiaryChange={handleAlternateBeneficiaryChange}
                  onEntireBeneficiaryChange={handleAlternateEntireBeneficiaryChange}
                  isAlternate={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Residue;
