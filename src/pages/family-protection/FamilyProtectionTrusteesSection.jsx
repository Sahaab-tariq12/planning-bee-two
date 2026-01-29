import React from "react";
import { FiPlus, FiCopy } from "react-icons/fi";
import FamilyProtectionTrusteeList from "./FamilyProtectionTrusteeList";
import { useAppContext } from "../../context/AppContext";

const FamilyProtectionTrusteesSection = () => {
  const { familyProtection, updateState } = useAppContext();
  const {
    clientsAsTrustees = false,
    client1Trustees = [],
    client2Trustees = []
  } = familyProtection;

  const updateFamilyProtection = (updates) => {
    updateState('familyProtection', {
      ...familyProtection,
      ...updates
    });
  };

  const handleClientsAsTrusteesChange = (e) => {
    updateFamilyProtection({ clientsAsTrustees: e.target.checked });
  };

  const handleAddTrustee = (clientKey) => {
    const newTrustee = {
      id: Date.now() + Math.random(),
      title: "",
      fullName: "",
      relationship: "",
      address: "",
      idSupplied: false,
      email: "",
      selectedPerson: "", // Track dropdown selection
    };

    if (clientKey === "client1") {
      updateFamilyProtection({
        client1Trustees: [...client1Trustees, newTrustee]
      });
    } else {
      updateFamilyProtection({
        client2Trustees: [...client2Trustees, newTrustee]
      });
    }
  };

  const handleTrusteeChange = (clientKey, id, field, value, newTrustee) => {
    console.log("=== TRUSTEE CHANGE DEBUG ===");
    console.log("clientKey:", clientKey);
    console.log("id:", id);
    console.log("field:", field);
    console.log("value:", value);
    console.log("newTrustee:", newTrustee);
    
    // Handle adding a new trustee
    if (field === 'add' && newTrustee) {
      console.log("Adding new trustee");
      if (clientKey === "client1") {
        updateFamilyProtection({
          client1Trustees: [...client1Trustees, newTrustee]
        });
      } else {
        updateFamilyProtection({
          client2Trustees: [...client2Trustees, newTrustee]
        });
      }
      return;
    }
    
    // Handle updating entire trustee object
    if (field === 'update' && newTrustee) {
      console.log("Updating entire trustee object");
      if (clientKey === "client1") {
        const updatedTrustees = client1Trustees.map((trustee) =>
          trustee.id === id ? newTrustee : trustee
        );
        console.log("Updated client1 trustees:", updatedTrustees);
        updateFamilyProtection({ client1Trustees: updatedTrustees });
      } else {
        const updatedTrustees = client2Trustees.map((trustee) =>
          trustee.id === id ? newTrustee : trustee
        );
        console.log("Updated client2 trustees:", updatedTrustees);
        updateFamilyProtection({ client2Trustees: updatedTrustees });
      }
      return;
    }
    
    // Handle updating existing trustee
    console.log("Updating single field");
    const trustees = clientKey === "client1" ? client1Trustees : client2Trustees;
    const updatedTrustees = trustees.map((trustee) =>
      trustee.id === id ? { ...trustee, [field]: value } : trustee
    );
    console.log("Field update result:", updatedTrustees);

    if (clientKey === "client1") {
      updateFamilyProtection({ client1Trustees: updatedTrustees });
    } else {
      updateFamilyProtection({ client2Trustees: updatedTrustees });
    }
  };

  const handleRemoveTrustee = (clientKey, id) => {
    if (clientKey === "client1") {
      updateFamilyProtection({
        client1Trustees: client1Trustees.filter((trustee) => trustee.id !== id)
      });
    } else {
      updateFamilyProtection({
        client2Trustees: client2Trustees.filter((trustee) => trustee.id !== id)
      });
    }
  };

  const handleCopyTrusteesToClient2 = () => {
    if (!client1Trustees.length) return;

    const copiedTrustees = client1Trustees.map((trustee) => ({
      ...trustee,
      id: Date.now() + Math.random(),
    }));

    updateFamilyProtection({
      client2Trustees: [...copiedTrustees]
    });
  };

  return (
    <>
      {/* Trustee Arrangements Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4">
        <h3 className="text-[14px] md:text-lg font-bold text-[#2D3748]">Trustee Arrangements</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-3 h-3 md:w-4 md:h-4"
            checked={clientsAsTrustees}
            onChange={handleClientsAsTrusteesChange}
          />
          <span className="text-gray-700 text-[14px] md:text-[16px]">
            Are clients to be trustees of their own trust?
          </span>
        </label>
      </div>

      {/* Client 1 Trustees Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-3 gap-2 md:gap-0 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
        <h3 className="text-lg font-bold text-blue-700">Client 1 Trustees</h3>
        <button
          type="button"
          onClick={() => handleAddTrustee("client1")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
        >
          <FiPlus size={18} />
          <span>Add Trustee</span>
        </button>
      </div>

      <FamilyProtectionTrusteeList
        trustees={client1Trustees}
        clientKey="client1"
        onChange={handleTrusteeChange}
        onRemove={handleRemoveTrustee}
      />

      {/* Client 2 Trustees Section */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-3 md:p-6 gap-2 md:gap-0 flex flex-col md:flex-row items-start md:items-center justify-between">
        <h3 className="text-lg font-bold text-green-700">Client 2 Trustees</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            type="button"
            onClick={handleCopyTrusteesToClient2}
            className="flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
          >
            <FiCopy size={18} />
            <span>Copy from Client 1</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddTrustee("client2")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
          >
            <FiPlus size={18} />
            <span>Add Trustee</span>
          </button>
        </div>
      </div>

      <FamilyProtectionTrusteeList
        trustees={client2Trustees}
        clientKey="client2"
        onChange={handleTrusteeChange}
        onRemove={handleRemoveTrustee}
      />
    </>
  );
};

export default FamilyProtectionTrusteesSection;
