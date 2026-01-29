import React, { useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { TITLE_OPTIONS } from "../../constants/options";
import {
  TYPE_OPTIONS,
  createInitialBeneficiary,
} from "../../constants/ResidueConstants";
import { useAppContext } from "../../context/AppContext";

const ResiduePercentageGroupForm = ({
  group,
  index,
  onRemove,
  onGroupChange,
  onGOCChange,
  onAddBeneficiary,
  onRemoveBeneficiary,
  onBeneficiaryChange,
  onEntireBeneficiaryChange,
  isAlternate = false,
}) => {
  const { clientDetails, willInstructions } = useAppContext();
  const [selectedClient, setSelectedClient] = useState("");

  // Generate people options from client details and will instructions
  const getPeopleOptions = () => {
    const options = [];

    // Add Client 1 if available
    if (clientDetails?.firstName && clientDetails?.lastName) {
      const client1FullName = `${clientDetails.firstName} ${clientDetails.lastName}`.trim();
      options.push({
        value: "client1",
        label: client1FullName,
        fullName: client1FullName,
        firstName: clientDetails.firstName,
        lastName: clientDetails.lastName,
        address: clientDetails.address || "",
      });
    }

    // Add Client 2 if available
    if (clientDetails?.firstName2 && clientDetails?.lastName2) {
      const client2FullName = `${clientDetails.firstName2} ${clientDetails.lastName2}`.trim();
      options.push({
        value: "client2",
        label: client2FullName,
        fullName: client2FullName,
        firstName: clientDetails.firstName2,
        lastName: clientDetails.lastName2,
        address: clientDetails.address || "",
      });
    }

    // Add Children if available
    if (willInstructions?.children && willInstructions.children.length > 0) {
      willInstructions.children.forEach((child) => {
        if (child.fullName) {
          const childFullName = child.fullName.trim();

          options.push({
            value: `child-${child.id}`,
            label: childFullName,
            fullName: childFullName,
            firstName: child.fullName.split(" ")[0] || "",
            lastName: child.fullName.split(" ").slice(1).join(" ") || "",
            type: "child",
            address: child.address || "",
          });
        }
      });
    }

    return options;
  };

  const peopleOptions = getPeopleOptions();

  // Handle dropdown selection for beneficiary
  const handlePersonSelect = (beneficiaryId, selectedValue) => {
    const selectedPerson = peopleOptions.find(
      (option) => option.value === selectedValue,
    );
    
    if (selectedPerson && onEntireBeneficiaryChange) {
      // Find the current beneficiary
      const currentBeneficiary = group.beneficiaries.find(b => b.id === beneficiaryId);
      
      if (currentBeneficiary) {
        // Update beneficiary object (only name and address, not title)
        const updatedBeneficiary = {
          ...currentBeneficiary,
          name: selectedPerson.fullName,
          address: selectedPerson.address || currentBeneficiary.address,
          selectedPerson: selectedValue,
        };
        
        onEntireBeneficiaryChange(group.id, beneficiaryId, updatedBeneficiary);
      }
    }
  };

  // Handle dropdown selection
  const handleClientSelection = (value) => {
    if (value && value !== "") {
      // Add the beneficiary
      onAddBeneficiary(value);

      // Keep the selection visible
      setSelectedClient(value);
    }
  };

  // Handle clicking on dropdown to reset selection
  const handleDropdownClick = () => {
    if (selectedClient) {
      setSelectedClient("");
    }
  };

  // Get available clients for beneficiary selection
  const availableClients = useMemo(() => {
    const clients = [];

    // Add client 1 if exists
    if (clientDetails?.firstName) {
      clients.push({
        id: "client1",
        fullName: `${clientDetails.firstName} ${clientDetails.lastName}`.trim(),
        relationship: "Self",
        isClient: true,
      });
    }

    // Add client 2 if exists
    if (clientDetails?.firstName2) {
      clients.push({
        id: "client2",
        fullName:
          `${clientDetails.firstName2} ${clientDetails.lastName2}`.trim(),
        relationship: "Partner",
        isClient: true,
      });
    }

    return clients;
  }, [clientDetails]);

  const RELATIONSHIP_OPTIONS = [
    { value: "son", label: "Son" },
    { value: "stepson", label: "Stepson" },
    { value: "daughter", label: "Daughter" },
    { value: "stepdaughter", label: "Step Daughter" },
    { value: "partners_son", label: "Partner's Son" },
    { value: "partners_daughter", label: "Partner's Daughter" },
    // { value: "other", label: "Other (Please specify)" }
  ];

  // Handle adding a new beneficiary (either new person or existing client)
  const handleAddBeneficiary = (clientId = null) => {
    if (clientId) {
      // Add existing client as beneficiary
      const client = availableClients.find((c) => c.id === clientId);
      if (client) {
        onAddBeneficiary(group.id, {
          ...createInitialBeneficiary(),
          name: client.fullName,
          relationship: client.relationship,
          isClient: true,
        });
      }
    } else {
      // Add new beneficiary
      onAddBeneficiary(group.id, createInitialBeneficiary());
    }
  };
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-start md:items-center justify-between">
        <h5 className="text-[14px] md:text-[16px] font-semibold text-[#1a202c]">
          Percentage Group {index + 1}
        </h5>
        <button
          type="button"
          onClick={() => onRemove(group.id)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-600 text-sm font-medium transition-colors hover:bg-red-100"
        >
          <FiTrash2 size={14} />
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <Input
            label="Percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={group.percentage}
            onChange={(e) => {
              const value = e.target.value;
              if (
                value === "" ||
                (parseFloat(value) >= 0 && parseFloat(value) <= 100)
              ) {
                onGroupChange(group.id, "percentage", value);
              }
            }}
            placeholder="e.g. 50"
            required
          />
        </div>
        <div className="w-full mt-[5px]">
          <Dropdown
            label="Type (Individual/Discretionary)"
            options={[
              { value: "", label: "Select type", disabled: true },
              ...TYPE_OPTIONS,
            ]}
            value={group.type}
            onChange={(value) => onGroupChange(group.id, "type", value)}
            placeholder="Select type"
            required
          />
        </div>
      </div>

      {/* Beneficiaries Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row text-start md:items-center gap-2 md:gap-0 justify-between">
            <h6 className="text-sm font-semibold text-[#1a202c]">
              Beneficiaries ({group.beneficiaries.length})
            </h6>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAddBeneficiary()}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <FiPlus size={16} />
                New Beneficiary
              </button>
            </div>
          </div>
        </div>

        {group.beneficiaries.length === 0 ? (
          <div className="py-6 px-4 bg-white rounded-lg border border-dashed border-gray-300 text-center text-gray-500 text-sm">
            No beneficiaries in this percentage group. Click{" "}
            <span className="font-semibold">"Add Beneficiary"</span> to add
            people to this percentage.
          </div>
        ) : (
          <div className="space-y-4">
            {group.beneficiaries.map((beneficiary, bIndex) => (
              <div
                key={beneficiary.id}
                className="bg-white rounded-lg border border-gray-200 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h6 className="text-xs md:text-sm font-semibold text-[#1a202c]">
                    Beneficiary {bIndex + 1}
                  </h6>
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveBeneficiary(group.id, beneficiary.id)
                    }
                    className="text-red-600 hover:text-red-700 text-xs md:text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="mt-1">
                    <Dropdown
                      label="Title"
                      options={TITLE_OPTIONS}
                      value={beneficiary.title}
                      onChange={(value) =>
                        onBeneficiaryChange(
                          group.id,
                          beneficiary.id,
                          "title",
                          value
                        )
                      }
                      placeholder="Title"
                    />
                  </div>
                  <Input
                    label="Name"
                    type="text"
                    value={beneficiary.name}
                    onChange={(e) =>
                      onBeneficiaryChange(
                        group.id,
                        beneficiary.id,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Full name"
                    required
                  />
                  <Input
                    label="Relationship"
                    type="text"
                    value={beneficiary.relationship}
                    onChange={(e) =>
                      onBeneficiaryChange(
                        group.id,
                        beneficiary.id,
                        "relationship",
                        e.target.value
                      )
                    }
                    placeholder="Enter relationship"
                  />
                </div>

                {/* Select from people dropdown */}
                <div className="space-y-2">
                  <label className="block font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
                    Or select from people in application
                  </label>
                  <Dropdown
                    options={
                      peopleOptions.length > 0
                        ? peopleOptions
                        : [
                          {
                            value: "no-people",
                            label: "No people found in application yet",
                            disabled: true,
                          },
                        ]
                    }
                    value={beneficiary.selectedPerson || ""}
                    onChange={(value) => handlePersonSelect(beneficiary.id, value)}
                    placeholder={
                      peopleOptions.length > 0
                        ? "Select from people mentioned in application..."
                        : "No people found in application yet"
                    }
                  />
                </div>

                <Input
                  label="Class Gift/Named Group"
                  type="text"
                  value={beneficiary.classGift}
                  onChange={(e) =>
                    onBeneficiaryChange(
                      group.id,
                      beneficiary.id,
                      "classGift",
                      e.target.value
                    )
                  }
                  placeholder="e.g., All children, Grandchildren"
                  maxLength={250}
                />
                <div className="flex justify-end items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {(beneficiary.classGift || "").length}/250 characters
                  </span>
                </div>

                <Input
                  label="Address"
                  type="textarea"
                  value={beneficiary.address}
                  onChange={(e) =>
                    onBeneficiaryChange(
                      group.id,
                      beneficiary.id,
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Full address"
                  rows={3}
                  maxLength={200}
                />
                <div className="flex justify-end items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {(beneficiary.address || "").length}/200 characters
                  </span>
                </div>

                <Input
                  label="Age of Vesting (if under 18)"
                  type="text"
                  value={beneficiary.ageOfVesting}
                  onChange={(e) =>
                    onBeneficiaryChange(
                      group.id,
                      beneficiary.id,
                      "ageOfVesting",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 21"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddBeneficiary(group.id)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <FiPlus size={16} />
          Add New Beneficiary
        </button>
      </div>

      {/* Gift Over Clause Section */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h6 className="text-xs md:text-sm font-semibold text-[#1a202c]">
          Gift Over Clause (GOC) - if gift fails
        </h6>
        <p className="text-xs md:text-sm text-gray-600">
          What happens if beneficiaries in this group die before the testator?
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={group.goc.giftOverToChildren}
              onChange={() => onGOCChange(group.id, "giftOverToChildren")}
            />
            <span className="text-xs md:text-sm text-gray-700">Gift over to children</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={group.goc.accruer}
              onChange={() => onGOCChange(group.id, "accruer")}
            />
            <span className="text-xs md:text-sm text-gray-700">
              Accruer (shared between others in group)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={group.goc.otherEntities}
              onChange={() => onGOCChange(group.id, "otherEntities")}
            />
            <span className="text-xs md:text-sm text-gray-700">
              Other entities in different shares (details below)
            </span>
          </label>
        </div>
      </div>

      {/* Further Details */}
      <div className="space-y-2">
        <h6 className="text-xs md:text-sm font-semibold text-[#1a202c]">
          Further details
        </h6>
        <Input
          type="textarea"
          value={group.furtherDetails}
          onChange={(e) =>
            onGroupChange(group.id, "furtherDetails", e.target.value)
          }
          placeholder="Enter further details..."
          rows={4}
          maxLength={400}
        />
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-gray-500">
            {(group.furtherDetails || "").length}/400 characters
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResiduePercentageGroupForm;
