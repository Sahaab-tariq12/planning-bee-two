import React, { useState } from "react";
import { FiPlus, FiChevronDown } from "react-icons/fi";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { useAppContext } from "../../context/AppContext";

const Bequests = () => {
  const {
    clientDetails = {},
    willInstructions = {},
    updateState,
  } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [editingBequest, setEditingBequest] = useState(null);
  const [formData, setFormData] = useState({
    giftType: "Money",
    bequestBy: [],
    effect: [],
    title: "",
    beneficiaryName: "",
    relationship: "",
    giftDescription: "",
    amount: "",
    giftHolding: [],
    classGift: "",
    beneficiaryAddress: "",
    vestingAge: "",
    otherConditions: "",
  });

  // Get existing bequests from context
  const existingBequests = willInstructions.bequests || [];

  // Debug: Log bequests data
  console.log("Bequests Component - Existing bequests:", existingBequests);
  console.log("Bequests Component - willInstructions:", willInstructions);

  const handleSaveBequest = () => {
    console.log("Saving bequest:", formData);
    
    if (editingBequest) {
      // Update existing bequest
      const updatedBequests = existingBequests.map((bequest) =>
        bequest.id === editingBequest.id ? { ...formData, id: editingBequest.id } : bequest
      );
      updateState("willInstructions.bequests", updatedBequests)
        .then(() => {
          console.log("Bequest updated successfully");
          resetForm();
        })
        .catch((error) => {
          console.error("Error updating bequest:", error);
        });
    } else {
      // Create new bequest
      const newBequest = { ...formData, id: Date.now() };
      updateState("willInstructions.bequests", [...existingBequests, newBequest])
        .then(() => {
          console.log("Bequest saved successfully");
          resetForm();
        })
        .catch((error) => {
          console.error("Error saving bequest:", error);
        });
    }
  };

  const resetForm = () => {
    setFormData({
      giftType: "Money",
      bequestBy: [],
      effect: [],
      title: "",
      beneficiaryName: "",
      relationship: "",
      giftDescription: "",
      amount: "",
      giftHolding: [],
      classGift: "",
      beneficiaryAddress: "",
      vestingAge: "",
      otherConditions: "",
    });
    setShowForm(false);
    setEditingBequest(null);
  };

  const handleEditBequest = (bequest) => {
    setFormData({
      ...bequest,
      bequestBy: bequest.bequestBy || [],
      effect: bequest.effect || [],
      giftHolding: bequest.giftHolding || [],
    });
    setEditingBequest(bequest);
    setShowForm(true);
  };

  const handleDeleteBequest = (bequestId) => {
    const updatedBequests = existingBequests.filter(
      (bequest) => bequest.id !== bequestId,
    );
    updateState("willInstructions.bequests", updatedBequests)
      .then(() => {
        console.log("Bequest deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting bequest:", error);
      });
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePersonSelect = (selectedValue) => {
    const selectedPerson = peopleOptions.find(
      (option) => option.value === selectedValue,
    );
    if (selectedPerson) {
      setFormData((prev) => ({
        ...prev,
        // Only update title if it's currently empty or if the selected person has a title
        // and user hasn't manually set a title before
        title: prev.title ? prev.title : selectedPerson.title || "",
        beneficiaryName: selectedPerson.fullName,
        beneficiaryAddress: selectedPerson.address || prev.beneficiaryAddress,
        selectedPerson: selectedValue,
      }));
    }
  };

  const handleGiftTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      giftType: type,
    }));
  };

  const handleCheckboxChange = (field) => (option) => {
    setFormData((prev) => {
      const currentValues = [...(prev[field] || [])];
      const index = currentValues.indexOf(option);

      if (index === -1) {
        currentValues.push(option);
      } else {
        currentValues.splice(index, 1);
      }

      return { ...prev, [field]: currentValues };
    });
  };

  const titleOptions = [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Miss", label: "Miss" },
    { value: "Ms", label: "Ms" },
    { value: "Dr", label: "Dr" },
    { value: "Prof", label: "Prof" },
    { value: "Rev", label: "Rev" },
  ];

  const relationshipOptions = [
    { value: "Spouse", label: "Spouse" },
    { value: "Child", label: "Child" },
    { value: "Parent", label: "Parent" },
    { value: "Sibling", label: "Sibling" },
    { value: "Friend", label: "Friend" },
    { value: "Other", label: "Other" },
  ];

  // Generate people options from client details
  const getPeopleOptions = () => {
    const options = [];

    // Add Client 1 if available
    if (clientDetails.firstName && clientDetails.lastName) {
      const client1FullName =
        `${clientDetails.title || ""} ${clientDetails.firstName} ${clientDetails.lastName}`.trim();
      options.push({
        value: "client1",
        label: client1FullName,
        fullName: client1FullName,
        title: clientDetails.title || "",
        firstName: clientDetails.firstName,
        lastName: clientDetails.lastName,
      });
    }

    // Add Client 2 if available
    if (clientDetails.firstName2 && clientDetails.lastName2) {
      const client2FullName =
        `${clientDetails.title2 || ""} ${clientDetails.firstName2} ${clientDetails.lastName2}`.trim();
      options.push({
        value: "client2",
        label: client2FullName,
        fullName: client2FullName,
        title: clientDetails.title2 || "",
        firstName: clientDetails.firstName2,
        lastName: clientDetails.lastName2,
      });
    }

    // Add Children if available
    if (willInstructions.children && willInstructions.children.length > 0) {
      willInstructions.children.forEach((child, index) => {
        if (child.fullName) {
          const childFullName =
            `${child.title || ""} ${child.fullName}`.trim();
          options.push({
            value: `child-${child.id}`,
            label: childFullName,
            fullName: childFullName,
            title: child.title || "",
            firstName: child.fullName.split(" ")[0] || "",
            lastName: child.fullName.split(" ").slice(1).join(" ") || "",
            type: "child",
          });
        }
      });
    }

    // Add Executors if available
    if (
      willInstructions.client1Executors &&
      willInstructions.client1Executors.length > 0
    ) {
      willInstructions.client1Executors.forEach((executor, index) => {
        if (executor.fullName && executor.relationship !== "Client") {
          options.push({
            value: `executor1-${index}`,
            label: executor.fullName,
            fullName: executor.fullName,
            title: executor.title || "",
            firstName: executor.fullName.split(" ")[0] || "",
            lastName: executor.fullName.split(" ").slice(1).join(" ") || "",
            type: "executor",
            address: executor.address,
          });
        }
      });
    }

    // Add Client 2 Executors if available
    if (
      willInstructions.client2Executors &&
      willInstructions.client2Executors.length > 0
    ) {
      willInstructions.client2Executors.forEach((executor, index) => {
        if (executor.fullName && executor.relationship !== "Client") {
          options.push({
            value: `executor2-${index}`,
            label: executor.fullName,
            fullName: executor.fullName,
            title: executor.title || "",
            firstName: executor.fullName.split(" ")[0] || "",
            lastName: executor.fullName.split(" ").slice(1).join(" ") || "",
            type: "executor",
            address: executor.address,
          });
        }
      });
    }

    return options;
  };

  const peopleOptions = getPeopleOptions();

  return (
    <div className="bg-[#F7F9FB] rounded-xl border border-gray-200 p-3 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h3 className="text-[16px] md:text-xl font-bold text-[#2D3748]">
            Legacies/Bequests
          </h3>
          <p className="text-gray-500 text-[12px] md:text-[16px]">
            Items to be left to specific people
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center mt-2 md:mt-0 gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiPlus size={18} />
            Add Bequest
          </button>
        )}
      </div>

      {/* Conditionally Rendered Form */}
      {showForm && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#2D3748]">
              {editingBequest ? "Edit Bequest" : "Add New Bequest"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {/* Money or Specific Gift */}
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
                Is this a gift of money or specific gift?
              </p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="giftType"
                    className="w-3 h-3 md:w-4 md:h-4"
                    checked={formData.giftType === "Money"}
                    onChange={() => handleGiftTypeChange("Money")}
                  />
                  <span className="text-gray-700 text-[14px] md:text-[16px]">
                    Money
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="giftType"
                    className="w-3 h-3 md:w-4 md:h-4"
                    checked={formData.giftType === "Specific Gift"}
                    onChange={() => handleGiftTypeChange("Specific Gift")}
                  />
                  <span className="text-gray-700 text-[14px] md:text-[16px]">
                    Specific Gift
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Inputs */}
            {formData.giftType === "Money" ? (
              <div className="space-y-6">
                <div>
                  <Input
                    label="Amount"
                    type="text"
                    value={formData.amount}
                    onChange={handleInputChange("amount")}
                    placeholder="e.g., £5,000"
                  />
                </div>

                <div className="space-y-3">
                  <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
                    How should this money gift be held?
                  </p>
                  <div className="space-y-3">
                    {[
                      "Direct gift",
                      "Discretionary trust",
                      "VPT (Vulnerable Persons Trust)",
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className=" w-3 h-3 md:w-4 md:h-4 rounded border-gray-300"
                          checked={formData.giftHolding.includes(option)}
                          onChange={() =>
                            handleCheckboxChange("giftHolding")(option)
                          }
                        />
                        <span className="text-gray-700 text-[14px] md:text-[16px]">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Input
                  label="Description of Gift"
                  type="text"
                  value={formData.giftDescription}
                  onChange={handleInputChange("giftDescription")}
                  placeholder="Describe the specific gift"
                />
              </div>
            )}
          </div>

          {/* Who is making bequest */}
          <div className="space-y-3">
            <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
              Who is making this bequest?
            </p>
            <div className="flex gap-6">
              {["Client 1", "Client 2", "Both"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300"
                    checked={formData.bequestBy.includes(item)}
                    onChange={() => {
                      const itemLower = item.toLowerCase();

                      if (itemLower === "both") {
                        // If "Both" is selected, select both "Client 1" and "Client 2"
                        const isBothCurrentlySelected =
                          formData.bequestBy.includes("Both");
                        const newBequestBy = isBothCurrentlySelected
                          ? [] // If unchecking "Both", clear all
                          : ["Client 1", "Client 2", "Both"]; // If checking "Both", select all three
                        setFormData((prev) => ({
                          ...prev,
                          bequestBy: newBequestBy,
                        }));
                      } else {
                        // Handle individual client selection
                        const currentValues = [...formData.bequestBy];
                        const index = currentValues.indexOf(item);

                        if (index === -1) {
                          currentValues.push(item);
                        } else {
                          currentValues.splice(index, 1);
                        }

                        // Auto-manage "Both" checkbox based on individual selections
                        const hasClient1 = currentValues.includes("Client 1");
                        const hasClient2 = currentValues.includes("Client 2");

                        if (hasClient1 && hasClient2) {
                          // Both clients selected - ensure "Both" is checked
                          if (!currentValues.includes("Both")) {
                            currentValues.push("Both");
                          }
                        } else {
                          // Not both clients selected - ensure "Both" is unchecked
                          const bothIndex = currentValues.indexOf("Both");
                          if (bothIndex !== -1) {
                            currentValues.splice(bothIndex, 1);
                          }
                        }

                        setFormData((prev) => ({
                          ...prev,
                          bequestBy: currentValues,
                        }));
                      }
                    }}
                  />
                  <span className="text-gray-700 text-[12px] md:text-[16px]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* When effect */}
          <div className="space-y-3">
            <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
              When should this bequest take effect?
            </p>
            <div className="flex gap-6">
              {["My Death", "2nd Death"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300"
                  />
                  <span className="text-gray-700 text-[14px] md:text-[16px]">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title and Beneficiary Name */}
          <div className="grid md:grid-cols-12 gap-4">
            <div className="col-span-8 md:col-span-4">
              <label className="block font-semibold text-[14px] md:text-[16px] text-[#2D3748] mb-2">
                Title
              </label>
              <Dropdown
                options={titleOptions}
                value={formData.title}
                onChange={handleInputChange("title")}
                placeholder="Select title"
              />
            </div>
            <div className="col-span-8">
              <label className="block font-semibold text-[14px] md:text-[16px] text-[#2D3748] mb-2">
                Beneficiary Name
              </label>
              <Input
                value={formData.beneficiaryName}
                onChange={handleInputChange("beneficiaryName")}
                placeholder="Enter beneficiary name"
              />
            </div>
          </div>

          {/* Select from people */}
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
              value={formData.selectedPerson || ""}
              onChange={handlePersonSelect}
              placeholder={
                peopleOptions.length > 0
                  ? "Select from people mentioned in application..."
                  : "No people found in application yet"
              }
              disabled={peopleOptions.length === 0}
            />
          </div>

          {/* Class gift */}
          <div className="space-y-2">
            <label className="block font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
              Class Gift/Named Group
            </label>
            <div className="space-y-2">
              <Input
                type="text"
                value={formData.classGift || ""}
                onChange={handleInputChange("classGift")}
                placeholder="e.g., All children, Grandchildren"
                maxLength={250}
              />
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {(formData.classGift || "").length}/250 characters
                </span>
              </div>
            </div>
          </div>

          {/* Beneficiary Address */}
          <div className="space-y-2">
            <Input
              label="Beneficiary Address"
              type="textarea"
              rows={3}
              value={formData.beneficiaryAddress || ""}
              onChange={handleInputChange("beneficiaryAddress")}
              placeholder="Full address of beneficiary"
              maxLength={200}
            />
            <div className="flex justify-end items-center mt-1">
              <span className="text-xs text-gray-500">
                {(formData.beneficiaryAddress || "").length}/200 characters
              </span>
            </div>
          </div>

          {/* Age of Vesting */}
          <div className="space-y-1">
            <Input
              label="Age of Vesting (Optional)"
              type="number"
              value={formData.vestingAge || ""}
              onChange={handleInputChange("vestingAge")}
              placeholder="e.g., 18, 21, 25"
            />
            <p className="text-sm text-gray-500 -mt-2">
              Age when beneficiary gains full control of the bequest
            </p>
          </div>

          {/* Other Conditions */}
          <div className="space-y-1">
            <Input
              label="Other Conditions (Optional)"
              type="textarea"
              rows={3}
              value={formData.otherConditions || ""}
              onChange={handleInputChange("otherConditions")}
              placeholder="e.g., GOC (Gift Over Clause) - if beneficiary dies before testator, gift goes to their children"
              maxLength={400}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs md:text-sm text-gray-500">
                Common conditions: GOC (Gift Over Clause), survival clauses,
                educational requirements, etc.
              </p>
              <span className="text-xs text-gray-500">
                {(formData.otherConditions || "").length}/400 characters
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleSaveBequest}
              className="px-4 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-[#357ABD] transition-colors"
            >
              {editingBequest ? "Update Bequest" : "Save Bequest"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Display Existing Bequests */}
      {existingBequests.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold text-[#2D3748]">Existing Bequests:</h4>
          {existingBequests.map((bequest, index) => (
            <div
              key={bequest.id || index}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="hidden md:block font-medium text-[#2D3748]">
                    {bequest.giftType === "Money"
                      ? `£${bequest.amount}`
                      : bequest.giftDescription}
                  </p>
                  <p className="text-sm text-gray-600">
                    To: {bequest.beneficiaryName || bequest.classGift}
                  </p>
                  {bequest.bequestBy && bequest.bequestBy.length > 0 && (
                    <p className="text-sm text-gray-500">
                      By: {bequest.bequestBy.join(", ")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBequest(bequest)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBequest(bequest.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bequests;
