import React, { useState } from "react";
import { FiTrash2, FiUserPlus } from "react-icons/fi";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { TITLE_OPTIONS, RELATIONSHIP_OPTIONS } from "../../constants/options";
import { useAppContext } from "../../context/AppContext";

const FamilyProtectionTrusteeList = ({
  trustees,
  clientKey,
  onChange,
  onRemove,
}) => {
  const { clientDetails, willInstructions } = useAppContext();
  const [selectedClient, setSelectedClient] = useState("");

  // Get available people for dropdown (excluding clients)
  const getAvailablePeople = () => {
    const people = [];

    // Add Client 1 if available
    if (clientDetails.firstName && clientDetails.lastName) {
      const client1FullName = `${clientDetails.firstName} ${clientDetails.lastName}`.trim();
      people.push({
        value: "client1",
        label: client1FullName,
        fullName: client1FullName,
        title: clientDetails.title || "",
        firstName: clientDetails.firstName,
        lastName: clientDetails.lastName,
        address: clientDetails.address || "",
        relationship: "Client",
      });
    }

    // Add Client 2 if available
    if (clientDetails.firstName2 && clientDetails.lastName2) {
      const client2FullName = `${clientDetails.firstName2} ${clientDetails.lastName2}`.trim();
      people.push({
        value: "client2",
        label: client2FullName,
        fullName: client2FullName,
        title: clientDetails.title2 || "",
        firstName: clientDetails.firstName2,
        lastName: clientDetails.lastName2,
        address: clientDetails.address2 || clientDetails.address || "",
        relationship: "Client",
      });
    }

    // Add children if available
    if (clientDetails?.children && clientDetails.children.length > 0) {
      clientDetails.children.forEach((child, index) => {
        if (child.firstName && child.lastName) {
          const childFullName = `${child.firstName} ${child.lastName}`.trim();
          people.push({
            value: `child-${index}`,
            label: childFullName,
            fullName: childFullName,
            title: child.title || "",
            relationship: "Child",
            address: child.address || "",
            type: "child",
          });
        }
      });
    }

    // Add executors if available from clientDetails
    if (clientDetails?.executors && clientDetails.executors.length > 0) {
      clientDetails.executors.forEach((executor, index) => {
        if (executor.fullName && executor.relationship !== "Client") {
          people.push({
            value: `executor-${index}`,
            label: executor.fullName,
            fullName: executor.fullName,
            title: executor.title || "",
            relationship: executor.relationship || "Executor",
            address: executor.address || "",
            type: "executor",
          });
        }
      });
    }

    // Add executors from willInstructions (Client 1)
    if (
      willInstructions?.client1Executors &&
      willInstructions.client1Executors.length > 0
    ) {
      willInstructions.client1Executors.forEach((executor, index) => {
        if (executor.fullName && executor.relationship !== "Client") {
          people.push({
            value: `executor1-${index}`,
            label: executor.fullName,
            fullName: executor.fullName,
            title: executor.title || "",
            relationship: executor.relationship || "Executor",
            address: executor.address || "",
            type: "executor",
          });
        }
      });
    }

    // Add executors from willInstructions (Client 2)
    if (
      willInstructions?.client2Executors &&
      willInstructions.client2Executors.length > 0
    ) {
      willInstructions.client2Executors.forEach((executor, index) => {
        if (executor.fullName && executor.relationship !== "Client") {
          people.push({
            value: `executor2-${index}`,
            label: executor.fullName,
            fullName: executor.fullName,
            title: executor.title || "",
            relationship: executor.relationship || "Executor",
            address: executor.address || "",
            type: "executor",
          });
        }
      });
    }

    // Add children from willInstructions if available
    if (willInstructions?.children && willInstructions.children.length > 0) {
      willInstructions.children.forEach((child, index) => {
        if (child.fullName) {
          people.push({
            value: `will-child-${index}`,
            label: child.fullName,
            fullName: child.fullName,
            title: child.title || "",
            relationship: child.relationship || "Child",
            address: child.address || "",
            type: "child",
          });
        }
      });
    }

    // Remove duplicates based on fullName and relationship
    const uniquePeople = [];
    const seen = new Set();

    people.forEach((person) => {
      const identifier = `${person.fullName}-${person.relationship}`;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        uniquePeople.push(person);
      }
    });

    return uniquePeople;
  };

  const availablePeople = getAvailablePeople();

  // Handle client selection change
  const handleClientSelect = (value) => {
    setSelectedClient(value);
    if (!value) return;
    const person = availablePeople.find((p) => p.value === value);
    if (!person) return;
    const newTrustee = {
      id: Date.now() + Math.random(),
      title: person.title,
      fullName: person.fullName,
      relationship: person.relationship,
      address: person.address,
      idSupplied: false,
      email: "",
      isClient: person.type === "child" || person.type === "executor",
      personType: person.type,
      personId: person.value,
    };
    onChange(clientKey, null, "add", newTrustee);
  };

  // Get available clients for the dropdown
  const availableClients = [
    {
      value: "client1",
      label:
        `${clientDetails.title || ""} ${clientDetails.firstName || ""} ${clientDetails.lastName || ""
          }`.trim() || "Client 1",
      title: clientDetails.title || "",
      fullName: `${clientDetails.firstName || ""} ${clientDetails.lastName || ""
        }`.trim(),
      relationship: clientKey === "client1" ? "Self" : "Spouse/Partner",
      address: clientDetails.address || "",
    },
    ...(clientDetails.firstName2
      ? [
        {
          value: "client2",
          label:
            `${clientDetails.title2 || ""} ${clientDetails.firstName2 || ""
              } ${clientDetails.lastName2 || ""}`.trim() || "Client 2",
          title: clientDetails.title2 || "",
          fullName: `${clientDetails.firstName2 || ""} ${clientDetails.lastName2 || ""
            }`.trim(),
          relationship: clientKey === "client2" ? "Self" : "Spouse/Partner",
          address: clientDetails.address2 || clientDetails.address || "",
        },
      ]
      : []),
  ].filter((client) => client.label);

  // Handle adding a person as a trustee
  const handleAddClientAsTrustee = () => {
    if (!selectedClient) return;

    const person = availablePeople.find((p) => p.value === selectedClient);
    if (!person) return;

    const newTrustee = {
      id: Date.now() + Math.random(),
      title: person.title,
      fullName: person.fullName,
      relationship: person.relationship,
      address: person.address,
      idSupplied: false,
      email: "",
      isClient: person.type === "child" || person.type === "executor",
      personType: person.type,
      personId: person.value,
    };

    onChange(clientKey, null, "add", newTrustee);
    setSelectedClient("");
  };

  if (!trustees || trustees.length === 0) {
    return null;
  }

  const handlePersonSelect = (trusteeId, selectedValue) => {
    console.log("=== PERSON SELECT DEBUG ===");
    console.log("trusteeId:", trusteeId);
    console.log("selectedValue:", selectedValue);
    
    const selectedPerson = availablePeople.find(
      (option) => option.value === selectedValue,
    );
    console.log("selectedPerson:", selectedPerson);
    
    if (selectedPerson) {
      const currentTrustee = trustees.find(t => t.id === trusteeId);
      console.log("currentTrustee:", currentTrustee);
      
      // Update the trustee with all the selected person's details
      const updatedTrustee = {
        ...currentTrustee,
        title: selectedPerson.title || "",
        fullName: selectedPerson.fullName,
        relationship: selectedPerson.relationship,
        address: selectedPerson.address || "",
        selectedPerson: selectedValue,
      };
      console.log("updatedTrustee:", updatedTrustee);
      console.log("Calling onChange with:", clientKey, trusteeId, "update", updatedTrustee);
      
      onChange(clientKey, trusteeId, "update", null, updatedTrustee);
    } else {
      console.log("No selected person found for value:", selectedValue);
    }
  };

  const handleFieldChange = (id, field, value) => {
    onChange(clientKey, id, field, value);
  };

  const handleRemove = (id) => {
    onRemove(clientKey, id);
  };

  // Filter out people that are already added as trustees
  const filteredAvailablePeople = availablePeople.filter(
    (person) =>
      !trustees.some(
        (trustee) =>
          trustee.fullName === person.fullName && trustee.type === person.type,
      ),
  );

  return (
    <div className="space-y-4">
      {trustees.map((trustee, index) => (
        <div
          key={trustee.id}
          className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-[#2D3748] font-semibold">
              Trustee {index + 1}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(trustee.id)}
              className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50"
            >
              <FiTrash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="mt-1.5">
              <Dropdown
                label="Title"
                options={TITLE_OPTIONS}
                value={trustee.title}
                onChange={(value) =>
                  handleFieldChange(trustee.id, "title", value)
                }
                placeholder="Select title"
              />
            </div>

            <Input
              label="Full Name"
              type="text"
              required
              value={trustee.fullName}
              onChange={(e) =>
                handleFieldChange(trustee.id, "fullName", e.target.value)
              }
              placeholder="Enter full name"
            />

            <Input
              label="Relationship"
              type="text"
              value={trustee.relationship}
              onChange={(e) =>
                handleFieldChange(trustee.id, "relationship", e.target.value)
              }
              placeholder="Enter relationship"
            />
            {/* Select from people dropdown */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block font-semibold text-[14px] md:text-[16px] text-[#2D3748] mb-2">
                Or select from people in application
              </label>
              <Dropdown
                options={
                  availablePeople.length > 0
                    ? availablePeople
                    : [
                      {
                        value: "no-people",
                        label: "No people found in application yet",
                        disabled: true,
                      },
                    ]
                }
                value={trustee.selectedPerson || ""}
                onChange={(value) => handlePersonSelect(trustee.id, value)}
                placeholder={
                  availablePeople.length > 0
                    ? "Select from people mentioned in application..."
                    : "No people found in application yet"
                }
                disabled={availablePeople.length === 0}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Input
                label="Address"
                type="textarea"
                required
                value={trustee.address}
                onChange={(e) =>
                  handleFieldChange(trustee.id, "address", e.target.value)
                }
                rows={3}
                placeholder="Enter address"
                maxLength={200}
              />
              <div className="flex justify-end items-center mt-1">
                <span className="text-xs text-gray-500">
                  {trustee.address.length}/200 characters
                </span>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={trustee.idSupplied}
                  onChange={(e) =>
                    handleFieldChange(
                      trustee.id,
                      "idSupplied",
                      e.target.checked,
                    )
                  }
                />
                <span className="text-gray-700">
                  ID Supplied
                  <span className="block text-gray-500 text-xs">
                    Check if ID document has been provided
                  </span>
                </span>
              </label>
              <Input
                label="Email Address (if no ID supplied)"
                type="email"
                value={trustee.email}
                onChange={(e) =>
                  handleFieldChange(trustee.id, "email", e.target.value)
                }
                placeholder="Email for verification"
              />
              <p className="text-gray-500 text-xs">
                Provide email if ID not supplied for online verification
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FamilyProtectionTrusteeList;
