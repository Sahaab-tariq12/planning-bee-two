import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import PropertyTrustForm from "./PropertyTrustForm";
import { initialPropertyTrust } from "./propertyTrustConstants";
import { useAppContext } from "../../context/AppContext";

const PropertyTrush = () => {
  const { willInstructions, updateState, clientDetails } = useAppContext();

  // Get client addresses from context
  const client1Address = clientDetails?.address || "";
  // If client2's address is empty, fall back to client1's address
  const client2Address = clientDetails?.address2 || client1Address;

  const propertyTrusts = willInstructions.propertyTrusts || [];

  const handleAddPropertyTrust = () => {
    const newTrusts = [...propertyTrusts, { ...initialPropertyTrust }];
    updateState("willInstructions", {
      ...willInstructions,
      propertyTrusts: newTrusts,
    });
  };

  const handleRemovePropertyTrust = (index) => {
    const newTrusts = [...propertyTrusts];
    newTrusts.splice(index, 1);
    updateState("willInstructions", {
      ...willInstructions,
      propertyTrusts: newTrusts,
    });
  };

  const handleRemoveLast = () => {
    if (propertyTrusts.length > 0) {
      handleRemovePropertyTrust(propertyTrusts.length - 1);
    }
  };

  const handleTrustChange = (index, field, value) => {
    const newTrusts = [...propertyTrusts];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newTrusts[index] = {
        ...newTrusts[index],
        [parent]: {
          ...(newTrusts[index][parent] || {}),
          [child]: value,
        },
      };
    } else {
      newTrusts[index] = {
        ...newTrusts[index],
        [field]: value,
      };
    }
    updateState("willInstructions", {
      ...willInstructions,
      propertyTrusts: newTrusts,
    });
  };

  const handleCheckboxChange = (index, field, subField) => {
    const newTrusts = [...propertyTrusts];
    newTrusts[index] = {
      ...newTrusts[index],
      [field]: {
        ...newTrusts[index][field],
        [subField]: !newTrusts[index][field][subField],
      },
    };
    updateState("willInstructions", {
      ...willInstructions,
      propertyTrusts: newTrusts,
    });
  };

  return (
    <div className="bg-[#F7F9FB] rounded-xl border border-gray-200 p-4 md:p-6 flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#2D3748]">
            Property Trusts/ROO
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {/* {propertyTrusts.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveLast}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 bg-white transition-colors shadow-sm"
            >
              <FiTrash2 size={18} />
              Remove Last
            </button>
          )} */}
          <button
            type="button"
            onClick={handleAddPropertyTrust}
            className="inline-flex mt-2 md:mt-0 items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiPlus size={18} />
            Add Property Trust
          </button>
        </div>
      </div>

      {/* Property Trust Forms */}
      {propertyTrusts.length === 0 ? (
        <div className="mt-4 py-10 px-4 bg-white rounded-lg border border-dashed border-gray-300 text-center text-gray-500 text-sm">
          No property trusts added yet. Click{" "}
          <span className="font-semibold">"Add Property Trust"</span> to get
          started.
        </div>
      ) : (
        <div className="space-y-6">
          {propertyTrusts.map((trust, index) => (
            <PropertyTrustForm
              key={index}
              trust={trust}
              index={index}
              onChange={handleTrustChange}
              onCheckboxChange={handleCheckboxChange}
              onRemove={() => handleRemovePropertyTrust(index)}
              client1Address={client1Address}
              client2Address={client2Address}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyTrush;
