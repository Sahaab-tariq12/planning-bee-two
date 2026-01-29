import React from "react";
import { FiTrash2 } from "react-icons/fi";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";

const TITLE_OPTIONS = [
  { value: "mr", label: "Mr" },
  { value: "mrs", label: "Mrs" },
  { value: "ms", label: "Ms" },
  { value: "miss", label: "Miss" },
  { value: "dr", label: "Dr" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "son", label: "Son" },
  { value: "stepson", label: "Stepson" },
  { value: "daughter", label: "Daughter" },
  { value: "stepdaughter", label: "Step Daughter" },
  { value: "partners_son", label: "Partner's Son" },
  { value: "partners_daughter", label: "Partner's Daughter" },
  // { value: "other", label: "Other (Please specify)" }
];

const ChildForm = ({ child, index, onUpdate, onRemove, errors = {} }) => {
  const handleChange = (field, value) => {
    onUpdate(child.id, field, value);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-xs md:text-sm text-[#1a202c]">Child {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(child.id)}
          className="inline-flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-red-500 text-white text-xs md:text-sm font-semibold hover:bg-red-600 transition-colors"
        >
          <FiTrash2 className="w-3 h-3 md:w-5 md:h-5" />
          Remove Child
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="mt-[8px]">
          <Dropdown
            label="Title"
            options={TITLE_OPTIONS}
            value={child.title}
            onChange={(value) => handleChange("title", value)}
            error={errors[`${child.id}-title`]}
            required
            placeholder="Select title"
          />
        </div>
        <div className="mt-[2px]">
          <Input
            label="Full Name"
            value={child.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            error={errors[`${child.id}-fullName`]}
            required
            placeholder="Enter full name"
          />
        </div>
        <Input
          label="Date of Birth"
          type="date"
          value={child.dob}
          onChange={(e) => handleChange("dob", e.target.value)}
          error={errors[`${child.id}-dob`]}
          placeholder="Select date of birth"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="mt-[6px]">
          <Dropdown
            label="Relationship to Client 1"
            options={RELATIONSHIP_OPTIONS}
            value={child.relationshipClient1}
            onChange={(value) => handleChange("relationshipClient1", value)}
            error={errors[`${child.id}-relationshipClient1`]}
            required
            placeholder="Select relationship"
          />
        </div>
        <div className="mt-[6px]">
          <Dropdown
            label="Relationship to Client 2"
            options={RELATIONSHIP_OPTIONS}
            value={child.relationshipClient2}
            onChange={(value) => handleChange("relationshipClient2", value)}
            placeholder="Select relationship"
          />
        </div>
      </div>

      <div style={{ position: "fixed", top: 720, left: 40, width: 500 }}>
        <div
          style={{
            backgroundColor: "rgb(240, 240, 240)",
            padding: 10,
            border: "1px solid rgb(200, 200, 200)",
            borderRadius: 5,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: "bold" }}>
            Official use only:
          </p>
        </div>
      </div>

      <Input
        label="Address"
        type="textarea"
        value={child.address}
        onChange={(e) => handleChange("address", e.target.value)}
        error={errors[`${child.id}-address`]}
        required
        placeholder="Child's current address"
        maxLength={200}
      />
      <div className="flex justify-end items-center mt-1">
        <span className="text-xs text-gray-500">
          {child.address.length}/200 characters
        </span>
      </div>
    </div>
  );
};

export default ChildForm;
