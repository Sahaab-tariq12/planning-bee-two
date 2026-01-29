import React from "react";
import { FiTrash2 } from "react-icons/fi";
import Dropdown from "../../components/Dropdown";
import Input from "../../components/Input";
import { useAppContext } from "../../context/AppContext";

const titleOptions = [
  { value: "mr", label: "Mr." },
  { value: "mrs", label: "Mrs." },
  { value: "ms", label: "Ms." },
  { value: "dr", label: "Dr." },
];

const ExecutorForm = ({
  executor: propExecutor,
  index,
  onChange,
  onRemove,
  showRemoveButton,
}) => {
  const {
    clientDetails = {},
    willInstructions = {},
  } = useAppContext();

  // Ensure we have a valid executor object with defaults
  const executor = propExecutor || {
    title: "",
    fullName: "",
    relationship: "",
    address: "",
    executorType: "sole",
    selectedPerson: "",
  };

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
        address: clientDetails.address || "",
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
        address: clientDetails.address || "",
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
            address: child.address || "",
          });
        }
      });
    }

    return options;
  };

  const peopleOptions = getPeopleOptions();

  const handleChange = (field, value) => {
    onChange({ ...executor, [field]: value });
  };

  const handlePersonSelect = (selectedValue) => {
    const selectedPerson = peopleOptions.find(
      (option) => option.value === selectedValue,
    );
    if (selectedPerson) {
      onChange({
        ...executor,
        title: selectedPerson.title || "",
        fullName: selectedPerson.fullName,
        address: selectedPerson.address || executor.address,
        selectedPerson: selectedValue,
      });
    }
  };

  return (
    <form
      noValidate
      className="relative bg-[#EFF6FF] border border-[#E6F0FF] rounded-xl p-2 md:p-6 mb-6"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="mt-1.5">
            <Dropdown
              label="Title"
              options={titleOptions}
              value={executor.title}
              onChange={(value) => handleChange("title", value)}
              placeholder="Select title"
              required
            />
          </div>
          <Input
            label="Full Name"
            type="text"
            value={executor.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Enter full name"
            required
          />
          <Input
            label="Relationship to Client"
            type="text"
            value={executor.relationship}
            onChange={(e) => handleChange("relationship", e.target.value)}
            placeholder="Enter relationship"
            required
          />
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
            value={executor.selectedPerson || ""}
            onChange={handlePersonSelect}
            placeholder={
              peopleOptions.length > 0
                ? "Select from people mentioned in application..."
                : "No people found in application yet"
            }
            disabled={peopleOptions.length === 0}
          />
        </div>
        <Input
          label="Full Address"
          type="textarea"
          value={executor.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Enter complete address"
          rows={3}
          required
          maxLength={200}
        />
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-gray-500">
            {executor.address.length}/200 characters
          </span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Executor Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {["sole", "joint", "substitute"].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="radio"
                    required
                    className="w-3 h-3 md:h-4 md:w-4 text-[#0080FF] focus:ring-[#0080FF] border-gray-300"
                    checked={executor.executorType === type}
                    onChange={() => handleChange("executorType", type)}
                  />
                  <span className="ml-2 text-gray-700 text-sm md:text-[16px]">
                    {type.charAt(0).toUpperCase() + type.slice(1)} Executor
                  </span>
                </label>
              ))}
            </div>
          </div>
          {showRemoveButton && (
            <button
              type="button"
              onClick={onRemove}
              className="mt-6 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium transition-colors"
            >
              <FiTrash2 size={14} />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default ExecutorForm;
