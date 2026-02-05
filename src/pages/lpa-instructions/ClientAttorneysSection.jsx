import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { TITLE_OPTIONS } from "../../constants/options";
import { useAppContext } from "../../context/AppContext";

const ClientAttorneysSection = ({
  activeTab,
  propertyAttorneys = [],
  healthAttorneys = [],
  propertyReplacementAttorneys = [],
  healthReplacementAttorneys = [],
  onUpdateAttorneys,
}) => {
  const { clientDetails, willInstructions } = useAppContext();
  const currentAttorneys =
    activeTab === "property" ? propertyAttorneys : healthAttorneys;
  const currentReplacementAttorneys =
    activeTab === "property"
      ? propertyReplacementAttorneys
      : healthReplacementAttorneys;

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
        title: clientDetails.title || "",
        firstName: clientDetails.firstName,
        lastName: clientDetails.lastName,
        address: clientDetails.address || "",
        dob: clientDetails.dob || "",
      });
    }

    // Add Client 2 if available
    if (clientDetails?.firstName2 && clientDetails?.lastName2) {
      const client2FullName = `${clientDetails.firstName2} ${clientDetails.lastName2}`.trim();
      options.push({
        value: "client2",
        label: client2FullName,
        fullName: client2FullName,
        title: clientDetails.title2 || "",
        firstName: clientDetails.firstName2,
        lastName: clientDetails.lastName2,
        address: clientDetails.address || "",
        dob: clientDetails.dob2 || "",
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
            title: child.title || "",
            firstName: child.fullName.split(" ")[0] || "",
            lastName: child.fullName.split(" ").slice(1).join(" ") || "",
            type: "child",
            address: child.address || "",
            dob: child.dob || "",
          });
        }
      });
    }

    return options;
  };

  const peopleOptions = getPeopleOptions();

  // Handle dropdown selection for attorney
  const handlePersonSelect = (attorneyId, selectedValue, isReplacement = false) => {
    const selectedPerson = peopleOptions.find(
      (option) => option.value === selectedValue,
    );
    
    if (selectedPerson) {
      // Find the current attorney
      const attorneys = isReplacement ? currentReplacementAttorneys : currentAttorneys;
      const currentAttorney = attorneys.find(a => a.id === attorneyId);
      
      if (currentAttorney) {
        // Update attorney object with all details including title
        const updatedAttorney = {
          ...currentAttorney,
          title: selectedPerson.title,
          name: selectedPerson.fullName,
          address: selectedPerson.address || currentAttorney.address,
          dob: selectedPerson.dob || currentAttorney.dob,
          selectedPerson: selectedValue,
        };
        
        // Update the attorneys array using the proper helper function
        const updatedAttorneys = attorneys.map(a => 
          a.id === attorneyId ? updatedAttorney : a
        );
        
        updateAttorneys(isReplacement, updatedAttorneys);
      }
    }
  };

  // Generate attorney options including clients
  const getAttorneyOptions = () => {
    const options = [];

    // Add client options if they exist
    if (clientDetails?.firstName && clientDetails?.lastName) {
      const client1FullName = `${"" || ""} ${
        clientDetails.firstName
      } ${clientDetails.lastName}`.trim();
      options.push({
        value: "client1",
        label: `Client 1: ${client1FullName}`,
        isClient: true,
      });
    }

    if (clientDetails?.firstName2 && clientDetails?.lastName2) {
      const client2FullName = `${"" || ""} ${
        clientDetails.firstName2
      } ${clientDetails.lastName2}`.trim();
      options.push({
        value: "client2",
        label: `Client 2: ${client2FullName}`,
        isClient: true,
      });
    }

    // If no clients exist, return just title options
    if (options.length === 0) {
      return TITLE_OPTIONS;
    }

    // Return client options first, then title options for other people
    const result = [
      ...options,
      ...TITLE_OPTIONS,
    ];
    return result;
  };
  // Get client details by client number
  const getClientDetails = (clientNum) => {
    if (clientNum === 1) {
      return {
        title: clientDetails?.title || "",
        name: `${clientDetails?.firstName || ""} ${
          clientDetails?.lastName || ""
        }`.trim(),
        dob: clientDetails?.dob || "",
        address: clientDetails?.address || "",
      };
    } else if (clientNum === 2) {
      return {
        title: clientDetails?.title2 || "",
        name: `${clientDetails?.firstName2 || ""} ${
          clientDetails?.lastName2 || ""
        }`.trim(),
        dob: clientDetails?.dob2 || "",
        address: clientDetails?.address2 || "",
      };
    }
    return null;
  };

  // Handle attorney selection change
  const handleAttorneySelectionChange = (
    id,
    field,
    value,
    isReplacement = false
  ) => {
    const { get } = getAttorneySetters(isReplacement);

    // If a client is selected, auto-populate their details
    if (value === "client1" || value === "client2") {
      const clientNum = value === "client1" ? 1 : 2;
      const clientInfo = getClientDetails(clientNum);

      if (clientInfo) {
        const updatedAttorneys = get.map((attorney) =>
          attorney.id === id
            ? {
                ...attorney,
                attorneyType: value, // Store the client selection
                title: clientInfo.title,
                name: clientInfo.name,
                dob: clientInfo.dob,
                address: clientInfo.address,
              }
            : attorney
        );
        updateAttorneys(isReplacement, updatedAttorneys);
        return;
      }
    }

    // For other selections, just update the field
    const updatedAttorneys = get.map((attorney) =>
      attorney.id === id ? { ...attorney, [field]: value } : attorney
    );
    updateAttorneys(isReplacement, updatedAttorneys);
  };

  // Helper function to get the current setter based on attorney type
  const getAttorneySetters = (isReplacement = false) => {
    if (isReplacement) {
      return {
        get:
          activeTab === "property"
            ? propertyReplacementAttorneys
            : healthReplacementAttorneys,
        type:
          activeTab === "property"
            ? "propertyReplacementAttorneys"
            : "healthReplacementAttorneys",
      };
    } else {
      return {
        get: activeTab === "property" ? propertyAttorneys : healthAttorneys,
        type:
          activeTab === "property" ? "propertyAttorneys" : "healthAttorneys",
      };
    }
  };

  const updateAttorneys = (isReplacement, updatedList) => {
    const { type } = getAttorneySetters(isReplacement);
    if (onUpdateAttorneys) {
      onUpdateAttorneys(type, updatedList);
    }
  };

  const handleAddAttorney = () => {
    const newAttorney = {
      id: Date.now(),
      attorneyType: "", // New field to track if this is a client or other person
      title: "",
      name: "",
      dob: "",
      address: "",
      selectedPerson: "", // Track dropdown selection
    };

    const { get, type } = getAttorneySetters();
    updateAttorneys(false, [...get, newAttorney]);
  };

  const handleAttorneyChange = (id, field, value) => {
    const { get } = getAttorneySetters();
    const updatedAttorneys = get.map((attorney) =>
      attorney.id === id ? { ...attorney, [field]: value } : attorney
    );
    updateAttorneys(false, updatedAttorneys);
  };

  const handleRemoveAttorney = (id) => {
    const { get } = getAttorneySetters();
    const updatedAttorneys = get.filter((attorney) => attorney.id !== id);
    updateAttorneys(false, updatedAttorneys);
  };

  const handleAddReplacementAttorney = () => {
    const newAttorney = {
      id: Date.now(),
      attorneyType: "", // New field to track if this is a client or other person
      title: "",
      name: "",
      dob: "",
      address: "",
      selectedPerson: "", // Track dropdown selection
    };

    const { get } = getAttorneySetters(true);
    updateAttorneys(true, [...get, newAttorney]);
  };

  const handleReplacementAttorneyChange = (id, field, value) => {
    const { get } = getAttorneySetters(true);
    const updatedAttorneys = get.map((attorney) =>
      attorney.id === id ? { ...attorney, [field]: value } : attorney
    );
    updateAttorneys(true, updatedAttorneys);
  };

  const handleRemoveReplacementAttorney = (id) => {
    const { get } = getAttorneySetters(true);
    const updatedAttorneys = get.filter((attorney) => attorney.id !== id);
    updateAttorneys(true, updatedAttorneys);
  };

  return (
    <>
      {/* Attorneys Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 justify-between">
        <label className="text-[#2D3748] font-medium">
          Attorneys -{" "}
          {activeTab === "property"
            ? "Property & Financial"
            : "Health & Welfare"}
        </label>
        <button
          type="button"
          onClick={handleAddAttorney}
          className="flex items-center text-[12px] md:text-[16px] px-4 py-2 bg-[#0080FF] text-white rounded-lg font-medium "
        >
          <FiPlus size={18} />
          <span>Add Attorney</span>
        </button>
      </div>

      {currentAttorneys.length > 0 && (
        <div className="space-y-4">
          {currentAttorneys.map((attorney, index) => (
            <div
              key={attorney.id}
              className="bg-[#F3F4F6] rounded-lg border border-gray-200 p-4 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#2D3748] font-semibold">
                  Attorney {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttorney(attorney.id)}
                  className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const hasClientOptions = getAttorneyOptions().some(
                    (option) => option.isClient || option.isOther
                  );
                  return hasClientOptions;
                })() ? (
                  <div className="mt-2">
                    <Dropdown
                      label="Attorney Selection"
                      options={getAttorneyOptions()}
                      value={attorney.attorneyType || ""}
                      onChange={(value) =>
                        handleAttorneySelectionChange(
                          attorney.id,
                          "attorneyType",
                          value,
                          false
                        )
                      }
                      placeholder="Select attorney..."
                    />
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <Dropdown
                      label="Title"
                      options={TITLE_OPTIONS}
                      value={attorney.title}
                      onChange={(value) =>
                        handleAttorneyChange(attorney.id, "title", value)
                      }
                      placeholder="Select title"
                    />
                  </div>
                )}
                {!attorney.attorneyType ||
                (attorney.attorneyType !== "client1" &&
                  attorney.attorneyType !== "client2") ? (
                  <div className="mt-0.5">
                    <Input
                      label="Name"
                      type="text"
                      value={attorney.name}
                      onChange={(e) =>
                        handleAttorneyChange(
                          attorney.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter name"
                    />
                  </div>
                ) : (
                  <>
                    <div className="mt-1.5">
                      <Input
                        label="Title"
                        type="text"
                        value={attorney.title}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="mt-0.5">
                      <Input
                        label="Name"
                        type="text"
                        value={attorney.name}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </>
                )}
                <Input
                  label="Date of Birth"
                  type="date"
                  value={attorney.dob}
                  onChange={(e) =>
                    handleAttorneyChange(attorney.id, "dob", e.target.value)
                  }
                  disabled={
                    attorney.attorneyType === "client1" ||
                    attorney.attorneyType === "client2"
                  }
                  className={
                    attorney.attorneyType === "client1" ||
                    attorney.attorneyType === "client2"
                      ? "bg-gray-100"
                      : ""
                  }
                />

                {/* Select from people dropdown */}
                <div className="space-y-2 col-span-full">
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
                    value={attorney.selectedPerson || ""}
                    onChange={(value) => handlePersonSelect(attorney.id, value, false)}
                    placeholder={
                      peopleOptions.length > 0
                        ? "Select from people mentioned in application..."
                        : "No people found in application yet"
                    }
                    disabled={peopleOptions.length === 0}
                    className="w-full"
                  />
                </div>

                <div className="col-span-full">
                  <Input
                    label="Address"
                    type="textarea"
                    value={attorney.address}
                    onChange={(e) =>
                      handleAttorneyChange(
                        attorney.id,
                        "address",
                        e.target.value
                      )
                    }
                    rows={3}
                    disabled={
                      attorney.attorneyType === "client1" ||
                      attorney.attorneyType === "client2"
                    }
                    maxLength={200}
                  />
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {attorney.address.length}/200 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Replacement Attorney Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0 justify-between">
        <label className="text-[#2D3748]  font-medium">
          Add Replacement Attorney -{" "}
          {activeTab === "property"
            ? "Property & Financial"
            : "Health & Welfare"}
        </label>
        <button
          type="button"
          onClick={handleAddReplacementAttorney}
          className="flex items-center gap-2 px-4 py-2 text-[12px] md:text-[16px] bg-[#0080FF] text-white rounded-lg font-medium"
        >
          <FiPlus size={18} />
          <span>Add Replacement Attorney</span>
        </button>
      </div>
      {currentReplacementAttorneys.length > 0 && (
        <div className="space-y-4">
          {currentReplacementAttorneys.map((attorney, index) => (
            <div
              key={attorney.id}
              className="bg-[#F3F4F6] rounded-lg border border-gray-200 p-4 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#2D3748] font-semibold">
                  Replacement Attorney {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveReplacementAttorney(attorney.id)}
                  className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAttorneyOptions().some(
                  (option) => option.isClient || option.isOther
                ) ? (
                  <div className="mt-2.5">
                    <Dropdown
                      label="Attorney Selection"
                      options={getAttorneyOptions()}
                      value={attorney.attorneyType || ""}
                      onChange={(value) =>
                        handleAttorneySelectionChange(
                          attorney.id,
                          "attorneyType",
                          value,
                          true
                        )
                      }
                      placeholder="Select attorney..."
                    />
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <Dropdown
                      label="Title"
                      options={TITLE_OPTIONS}
                      value={attorney.title}
                      onChange={(value) =>
                        handleReplacementAttorneyChange(
                          attorney.id,
                          "title",
                          value
                        )
                      }
                      placeholder="Select title"
                    />
                  </div>
                )}
                {!attorney.attorneyType ||
                (attorney.attorneyType !== "client1" &&
                  attorney.attorneyType !== "client2") ? (
                  <div className="mt-0.5">
                    <Input
                      label="Name"
                      type="text"
                      value={attorney.name}
                      onChange={(e) =>
                        handleReplacementAttorneyChange(
                          attorney.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Enter name"
                    />
                  </div>
                ) : (
                  <>
                    <div className="mt-1.5">
                      <Input
                        label="Title"
                        type="text"
                        value={attorney.title}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div className="mt-1.5">
                      <Input
                        label="Name"
                        type="text"
                        value={attorney.name}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </>
                )}
                <Input
                  label="Date of Birth"
                  type="date"
                  value={attorney.dob}
                  onChange={(e) =>
                    handleReplacementAttorneyChange(
                      attorney.id,
                      "dob",
                      e.target.value
                    )
                  }
                  disabled={
                    attorney.attorneyType === "client1" ||
                    attorney.attorneyType === "client2"
                  }
                  className={
                    attorney.attorneyType === "client1" ||
                    attorney.attorneyType === "client2"
                      ? "bg-gray-100"
                      : ""
                  }
                />

                {/* Select from people dropdown */}
                <div className="space-y-2 col-span-full">
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
                    value={attorney.selectedPerson || ""}
                    onChange={(value) => handlePersonSelect(attorney.id, value, true)}
                    placeholder={
                      peopleOptions.length > 0
                        ? "Select from people mentioned in application..."
                        : "No people found in application yet"
                    }
                    disabled={peopleOptions.length === 0}
                    className="w-full"
                  />
                </div>

                <div className="col-span-full">
                  <Input
                    label="Address"
                    type="textarea"
                    value={attorney.address}
                    onChange={(e) =>
                      handleReplacementAttorneyChange(
                        attorney.id,
                        "address",
                        e.target.value
                      )
                    }
                    rows={3}
                    disabled={
                      attorney.attorneyType === "client1" ||
                      attorney.attorneyType === "client2"
                    }
                    className={
                      attorney.attorneyType === "client1" ||
                      attorney.attorneyType === "client2"
                        ? "bg-gray-100"
                        : ""
                    }
                    maxLength={200}
                  />
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {attorney.address.length}/200 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ClientAttorneysSection;
