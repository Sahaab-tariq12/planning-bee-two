import React, { useState, useEffect, useRef } from "react";
import { FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { useAppContext } from "../../context/AppContext";

const PropertyTrustForm = ({
  trust,
  index,
  onChange,
  onCheckboxChange,
  onRemove,
  client1Address,
  client2Address,
}) => {
  const { clientDetails = {}, willInstructions = {} } = useAppContext();
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const availableAddresses = [];
    if (client1Address)
      availableAddresses.push({
        label: "Client 1 Address",
        value: client1Address,
      });
    if (client2Address)
      availableAddresses.push({
        label: "Client 2 Address",
        value: client2Address,
      });
    setAddresses(availableAddresses);
  }, [client1Address, client2Address]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddressSelect = (address) => {
    handleChange("propertyAddress", address);
    setShowAddressDropdown(false);
  };
  const handleChange = (field, value) => {
    onChange(index, field, value);
  };

  const handleCheckboxToggle = (field, subField) => {
    onCheckboxChange(index, field, subField);
  };

  // Generate people options from client details (similar to ExecutorForm)
  const getPeopleOptions = () => {
    const options = [];

    // Add Client 1 if available
    if (clientDetails.firstName && clientDetails.lastName) {
      const client1FullName =
        `${clientDetails.firstName} ${clientDetails.lastName}`.trim();
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
    if (clientDetails.firstName2 && clientDetails.lastName2) {
      const client2FullName =
        `${clientDetails.firstName2} ${clientDetails.lastName2}`.trim();
      options.push({
        value: "client2",
        label: client2FullName,
        fullName: client2FullName,
        firstName: clientDetails.firstName2,
        lastName: clientDetails.lastName2,
        address: clientDetails.address2 || clientDetails.address || "",
      });
    }

    // Add Children if available
    if (willInstructions.children && willInstructions.children.length > 0) {
      willInstructions.children.forEach((child, index) => {
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

  const handlePersonSelect = (selectedValue) => {
    const selectedPerson = peopleOptions.find(
      (option) => option.value === selectedValue,
    );
    if (selectedPerson) {
      handleChange("occupantLifeTenant", {
        ...trust.occupantLifeTenant,
        otherName: selectedPerson.fullName,
        otherDetails: selectedPerson.address || "",
        selectedPerson: selectedValue,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-3 md:gap-6">
      <div className="mb-2">
        <h4 className="text-lg font-semibold text-[#1a202c]">
          Property Trust {index + 1}
        </h4>
      </div>

      {/* Is this a PPT (ROO for each other) or a standalone ROO? */}
      <div className="space-y-3">
        <p className="font-semibold text-[13px] md:text-[16px] text-[#2D3748]">
          Is this a PPT (ROO for each other) or a standalone ROO?
        </p>
        <div className="flex flex-col md:flex-row gap-1 md:gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`trustType-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.trustType === "ppt"}
              onChange={() => handleChange("trustType", "ppt")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">PPT (ROO for each other)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`trustType-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.trustType === "standalone"}
              onChange={() => handleChange("trustType", "standalone")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Standalone ROO</span>
          </label>
        </div>
      </div>

      {/* Who requires this trust? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Who requires this trust?
        </p>
        <div className="flex flex-col md:flex-row gap-1 md:gap-6">
          {["Client 1", "Client 2", "Both"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name={`whoRequires-${index}`}
                className="w-3 h-3 md:w-4 md:h-4"
                checked={
                  trust.whoRequires === option.toLowerCase().replace(" ", "")
                }
                onChange={() =>
                  handleChange(
                    "whoRequires",
                    option.toLowerCase().replace(" ", "")
                  )
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Property Address */}
      <div className="space-y-2 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Address
        </label>
        <div className="relative">
          <div
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 cursor-pointer flex justify-between items-center"
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
          >
            <span
              className={
                trust.propertyAddress ? "text-gray-900 text-[14px] md:text-[16px]" : "text-gray-400 text-[14px] md:text-[16px]"
              }
            >
              {trust.propertyAddress || "Select an address or type manually"}
            </span>
            {showAddressDropdown ? <FiChevronUp /> : <FiChevronDown />}
          </div>

          {showAddressDropdown && addresses.length > 0 && (
            <div ref={dropdownRef} className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-60 overflow-auto">
              {addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAddressSelect(addr.value)}
                >
                  <div className="font-medium text-gray-900">{addr.label}</div>
                  <div className="text-gray-500 text-sm">{addr.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">
            Or enter address manually:
          </p>
          <Input
            type="textarea"
            rows={3}
            value={trust.propertyAddress}
            onChange={(e) => handleChange("propertyAddress", e.target.value)}
            placeholder="Enter property address"
            maxLength={200}
          />
          <div className="flex justify-end items-center mt-1">
            <span className="text-xs text-gray-500">
              {trust.propertyAddress.length}/200 characters
            </span>
          </div>
        </div>
      </div>

      {/* Is a transfer to joint names required? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Is a transfer to joint names required?
        </p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`transferToJointNames-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.transferToJointNames === "yes"}
              onChange={() => handleChange("transferToJointNames", "yes")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`transferToJointNames-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.transferToJointNames === "no"}
              onChange={() => handleChange("transferToJointNames", "no")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
          </label>
        </div>
      </div>

      {/* Is a SEV of tenancy required? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Is a SEV of tenancy required?
        </p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`sevOfTenancyRequired-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.sevOfTenancyRequired === "yes"}
              onChange={() => handleChange("sevOfTenancyRequired", "yes")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`sevOfTenancyRequired-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.sevOfTenancyRequired === "no"}
              onChange={() => handleChange("sevOfTenancyRequired", "no")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
          </label>
        </div>
      </div>

      {/* Who is the Occupant/Life Tenant? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Who is the Occupant/Life Tenant?
        </p>
        <div className="flex flex-wrap gap-6 mb-3">
          {["Client 1", "Client 2", "Both"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300"
                checked={
                  trust.occupantLifeTenant[
                  option.toLowerCase().replace(" ", "")
                  ]
                }
                onChange={() => {
                  const field = option.toLowerCase().replace(" ", "");
                  
                  // If "Both" is being selected, automatically select "Client 1" and "Client 2"
                  if (field === "both") {
                    const newOccupantLifeTenant = {
                      ...trust.occupantLifeTenant,
                      both: !trust.occupantLifeTenant.both,
                      client1: !trust.occupantLifeTenant.both ? true : false,
                      client2: !trust.occupantLifeTenant.both ? true : false,
                      other: false,
                      otherName: "",
                    };
                    handleChange("occupantLifeTenant", newOccupantLifeTenant);
                  } else {
                    // Handle "Client 1" or "Client 2" selection
                    const newOccupantLifeTenant = {
                      ...trust.occupantLifeTenant,
                      [field]: !trust.occupantLifeTenant[field],
                      other: false,
                      otherName: "",
                    };
                    
                    // If both Client 1 and Client 2 are selected, automatically check "Both"
                    if (field === "client1" && newOccupantLifeTenant.client1 && newOccupantLifeTenant.client2) {
                      newOccupantLifeTenant.both = true;
                    } else if (field === "client2" && newOccupantLifeTenant.client1 && newOccupantLifeTenant.client2) {
                      newOccupantLifeTenant.both = true;
                    } else {
                      // If "Both" was checked and we're unchecking one of the individual clients, uncheck "Both"
                      newOccupantLifeTenant.both = false;
                    }
                    
                    handleChange("occupantLifeTenant", newOccupantLifeTenant);
                  }
                }}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">{option}</span>
            </label>
          ))}

          {/* Other Option */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300"
              checked={trust.occupantLifeTenant.other || false}
              onChange={(e) => {
                const isChecked = e.target.checked;
                handleChange("occupantLifeTenant", {
                  ...trust.occupantLifeTenant,
                  other: isChecked,
                  // Clear other options if 'Other' is selected
                  client1: isChecked ? false : trust.occupantLifeTenant.client1,
                  client2: isChecked ? false : trust.occupantLifeTenant.client2,
                  both: isChecked ? false : trust.occupantLifeTenant.both,
                  otherName: isChecked
                    ? trust.occupantLifeTenant.otherName || ""
                    : "",
                });
              }}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Other</span>
          </label>
        </div>

        {/* Other Occupant Details */}
        {trust.occupantLifeTenant?.other && (
          <div className="space-y-3">
            {/* Manual input fields first */}
            <div className="space-y-2">
              <Input
                type="text"
                value={trust.occupantLifeTenant.otherName || ""}
                onChange={(e) =>
                  handleChange("occupantLifeTenant", {
                    ...trust.occupantLifeTenant,
                    otherName: e.target.value,
                    selectedPerson: "", // Clear selected person when manually typing
                  })
                }
                placeholder="Enter occupant/tenant name"
                className="w-full md:w-1/2"
              />
              <Input
                type="textarea"
                rows={3}
                value={trust.occupantLifeTenant.otherDetails || ""}
                onChange={(e) =>
                  handleChange("occupantLifeTenant", {
                    ...trust.occupantLifeTenant,
                    otherDetails: e.target.value,
                  })
                }
                placeholder="Additional details (address, relationship, etc.)"
                maxLength={300}
              />
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {(trust.occupantLifeTenant.otherDetails || "").length}/300 characters
                </span>
              </div>
            </div>

            {/* Select from people dropdown after input */}
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
                value={trust.occupantLifeTenant.selectedPerson || ""}
                onChange={handlePersonSelect}
                placeholder={
                  peopleOptions.length > 0
                    ? "Select from people mentioned in application..."
                    : "No people found in application yet"
                }
                disabled={peopleOptions.length === 0}
              />
            </div>
          </div>
        )}
      </div>

      {/* Period of tenancy? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">Period of tenancy?</p>

        <div className="flex flex-wrap gap-6 items-center">
          {/* LIFE */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`periodOfTenancy-${index}`}
              value="life" // Added value for robustness
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.periodOfTenancy === "life"}
              onChange={() => {
                handleChange("periodOfTenancy", "life");
                // Clear fixed term when selecting "Life"
                if (trust.fixedTerm) {
                  handleChange("fixedTerm", "");
                }
              }}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Life</span>
          </label>

          {/* FIXED */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`periodOfTenancy-${index}`}
              value="fixed" // Added value for robustness
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.periodOfTenancy === "fixed"}
              onChange={() => handleChange("periodOfTenancy", "fixed")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Fixed term</span>
          </label>

          {/* FIXED TERM INPUT */}
          {trust.periodOfTenancy === "fixed" && (
            <div className="w-48">
              <Input
                type="text"
                value={trust.fixedTerm}
                onChange={(e) => handleChange("fixedTerm", e.target.value)}
                placeholder="Specify fixed term"
                maxLength={100}
              />
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {(trust.fixedTerm || "").length}/100
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Will life tenant end on? (can select multiple) */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Will life tenant end on? (can select multiple)
        </p>
        <div className="flex flex-col md:flex-row gap-1 md:gap-6">
          {["Cohabitation", "Marriage", "Age"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300"
                checked={trust.lifeTenantEndsOn[option.toLowerCase()]}
                onChange={() =>
                  handleCheckboxToggle(
                    "lifeTenantEndsOn",
                    option.toLowerCase()
                  )
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Is this a flexible life interest trust? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          Is this a flexible life interest trust?
        </p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`flexibleLifeInterestTrust-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.flexibleLifeInterestTrust === "yes"}
              onChange={() => handleChange("flexibleLifeInterestTrust", "yes")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`flexibleLifeInterestTrust-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.flexibleLifeInterestTrust === "no"}
              onChange={() => handleChange("flexibleLifeInterestTrust", "no")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
          </label>
        </div>
      </div>

      {/* Is there a right to substitute? */}
      <div className="space-y-3">
        <p className="font-semibold text-[13px] md:text-[16px] text-[#2D3748]">
          Is there a right to substitute?
        </p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`rightToSubstitute-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.rightToSubstitute === "yes"}
              onChange={() => handleChange("rightToSubstitute", "yes")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`rightToSubstitute-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.rightToSubstitute === "no"}
              onChange={() => handleChange("rightToSubstitute", "no")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
          </label>
        </div>
      </div>

      {/* In the event of a downsizing what happens to the surplus? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          In the event of a downsizing what happens to the surplus?
        </p>
        <div className="space-y-1 md:space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`downsizingSurplus-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.downsizingSurplus === "residual"}
              onChange={() => handleChange("downsizingSurplus", "residual")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">Pass to residual estate</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`downsizingSurplus-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.downsizingSurplus === "income"}
              onChange={() => handleChange("downsizingSurplus", "income")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">
              Provide income for Occupant
            </span>
          </label>
          <div className="flex flex-col items-start gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`downsizingSurplus-${index}`}
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trust.downsizingSurplus === "other"}
                onChange={() => handleChange("downsizingSurplus", "other")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Other</span>
            </label>
            {trust.downsizingSurplus === "other" && (
              <div className="w-full">
                <Input
                  type="text"
                  value={trust.downsizingOther}
                  onChange={(e) =>
                    handleChange("downsizingOther", e.target.value)
                  }
                  placeholder="Specify other provision"
                  className="w-full"
                  maxLength={120}
                />
                <div className="flex justify-end items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {trust.downsizingOther.length}/120 characters
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What happens when the trust period ends? */}
      <div className="space-y-3">
        <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
          What happens when the trust period ends?
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`trustPeriodEnds-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.trustPeriodEnds === "residual"}
              onChange={() => handleChange("trustPeriodEnds", "residual")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">
              Pass to residual estate, life tenant is not a residual
              beneficiary
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`trustPeriodEnds-${index}`}
              className="w-3 h-3 md:w-4 md:h-4"
              checked={trust.trustPeriodEnds === "secondLevel"}
              onChange={() => handleChange("trustPeriodEnds", "secondLevel")}
            />
            <span className="text-gray-700 text-[14px] md:text-[16px]">
              Pass to the second level of residue as if first has failed
              (Spouse has predeceased)
            </span>
          </label>
          <div className="flex flex-col items-start gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`trustPeriodEnds-${index}`}
                className="w-3 h-3 md:w-4 md:h-4"
                checked={trust.trustPeriodEnds === "other"}
                onChange={() => handleChange("trustPeriodEnds", "other")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Other</span>
            </label>
          </div>
          {trust.trustPeriodEnds === "other" && (
            <div className="w-full">
              <Input
                type="text"
                value={trust.trustPeriodEndsOther}
                onChange={(e) =>
                  handleChange("trustPeriodEndsOther", e.target.value)
                }
                placeholder="Specify other provision"
                className="w-full"
                maxLength={120}
              />
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {trust.trustPeriodEndsOther.length}/120 characters
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove Button at the bottom right */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-300 bg-red-50 text-red-600 text-[10px] md:text-sm font-medium transition-colors"
        >
          <FiTrash2 size={14} />
          Remove This Property Trust
        </button>
      </div>
    </div>
  );
};

export default PropertyTrustForm;