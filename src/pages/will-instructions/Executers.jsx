import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiPlus } from "react-icons/fi";
import ExecutorForm from "./ExecutorForm";
import { useAppContext } from "../../context/AppContext";
import { FiUserCheck } from "react-icons/fi";

const initialExecutor = {
  title: "",
  fullName: "",
  relationship: "",
  address: "",
  executorType: "sole",
  selectedPerson: "",
};

const Executers = ({ onValidationChange }) => {
  const { willInstructions, updateState, clientDetails = {} } = useAppContext();

  // Initialize executors for client 1 and client 2
  const [client1Executors, setClient1Executors] = useState(
    willInstructions.client1Executors || [{ ...initialExecutor }],
  );
  const [client2Executors, setClient2Executors] = useState(
    willInstructions.client2Executors || [{ ...initialExecutor }],
  );
  const [sameAsClient1, setSameAsClient1] = useState(false);

  const [isFormValid, setIsFormValid] = useState(false);

  // Check if there are two clients
  const hasTwoClients = clientDetails?.firstName && clientDetails?.firstName2;

  // State for clients nominating each other
  const [clientsNominatingEachOther, setClientsNominatingEachOther] = useState(
    willInstructions.clientsNominatingEachOther || "no",
  );

  // Debugging logs
  useEffect(() => {
    console.log("Client Details:", clientDetails);
    console.log("Has Two Clients:", hasTwoClients);
    console.log("Client 1:", clientDetails?.firstName, clientDetails?.lastName);
    console.log(
      "Client 2:",
      clientDetails?.firstName2,
      clientDetails?.lastName2,
    );
  }, [clientDetails, hasTwoClients]);

  // Sync local state with context state only on initial mount
  useEffect(() => {
    console.log("=== EXECUTORS SYNC DEBUG ===");
    console.log(
      "willInstructions.client1Executors:",
      willInstructions.client1Executors,
    );
    console.log(
      "willInstructions.client2Executors:",
      willInstructions.client2Executors,
    );
    console.log("current client1Executors:", client1Executors);
    console.log("current client2Executors:", client2Executors);

    // Always sync if context has data and local state is empty or only has default empty executor
    if (
      willInstructions.client1Executors &&
      willInstructions.client1Executors.length > 0
    ) {
      if (
        client1Executors.length === 1 &&
        client1Executors[0].fullName === ""
      ) {
        console.log("Syncing client1Executors from context");
        setClient1Executors(willInstructions.client1Executors);
      }
    }

    if (
      willInstructions.client2Executors &&
      willInstructions.client2Executors.length > 0
    ) {
      if (
        client2Executors.length === 1 &&
        client2Executors[0].fullName === ""
      ) {
        console.log("Syncing client2Executors from context");
        setClient2Executors(willInstructions.client2Executors);
      }
    }

    if (
      willInstructions.clientsNominatingEachOther &&
      clientsNominatingEachOther === "no"
    ) {
      console.log("Syncing clientsNominatingEachOther from context");
      setClientsNominatingEachOther(
        willInstructions.clientsNominatingEachOther,
      );
    }
  }, []); // Empty dependency array - only run on mount

  // Validate all executors
  const validateExecutors = useCallback(() => {
    // If clients are nominating each other, we don't need additional validation
    if (clientsNominatingEachOther === "yes" && hasTwoClients) {
      setIsFormValid(true);
      return true;
    }

    // Validate client 1's executors
    const isClient1Valid =
      client1Executors.length > 0 &&
      client1Executors.every(
        (executor) =>
          executor &&
          executor.title &&
          executor.fullName &&
          executor.relationship &&
          executor.address &&
          executor.executorType,
      );

    // If there are two clients, validate client 2's executors as well
    let isClient2Valid = true;
    if (hasTwoClients) {
      // If same as client 1, use client 1 validation
      if (sameAsClient1) {
        isClient2Valid = isClient1Valid;
      } else {
        isClient2Valid =
          client2Executors.length > 0 &&
          client2Executors.every(
            (executor) =>
              executor &&
              executor.title &&
              executor.fullName &&
              executor.relationship &&
              executor.address &&
              executor.executorType,
          );
      }
    }

    const isValid = isClient1Valid && isClient2Valid;
    setIsFormValid(isValid);
    return isValid;
  }, [
    client1Executors,
    client2Executors,
    clientsNominatingEachOther,
    hasTwoClients,
    sameAsClient1,
  ]);

  // Update parent component about validation status
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validateExecutors());
    }
  }, [validateExecutors, onValidationChange]);

  // Track previous values to prevent unnecessary updates
  const prevExecutorsRef = useRef({
    client1: JSON.stringify(willInstructions.client1Executors || []),
    client2: JSON.stringify(willInstructions.client2Executors || []),
    nomination: willInstructions.clientsNominatingEachOther || "no",
  });
  const isInternalUpdate = useRef(false);

  // Update willInstructions when relevant state changes
  useEffect(() => {
    const currentClient1Str = JSON.stringify(client1Executors);
    const currentClient2Str = JSON.stringify(
      sameAsClient1 ? client1Executors : client2Executors,
    );
    const currentNomination = clientsNominatingEachOther;

    const prevClient1Str = prevExecutorsRef.current.client1;
    const prevClient2Str = prevExecutorsRef.current.client2;
    const prevNomination = prevExecutorsRef.current.nomination;

    // Only update if values have actually changed
    if (
      currentClient1Str !== prevClient1Str ||
      currentClient2Str !== prevClient2Str ||
      currentNomination !== prevNomination
    ) {
      if (!isInternalUpdate.current) {
        const currentWillInstructions = willInstructions || {};

        updateState("willInstructions", {
          ...currentWillInstructions,
          clientsNominatingEachOther: currentNomination,
          client1Executors,
          client2Executors: hasTwoClients
            ? sameAsClient1
              ? client1Executors
              : client2Executors
            : [],
          // If clients are nominating each other, add them as executors
          ...(currentNomination === "yes" && hasTwoClients
            ? {
                client1Executors: [
                  {
                    ...initialExecutor,
                    title: clientDetails?.title || "",
                    fullName:
                      `${clientDetails?.firstName || ""} ${clientDetails?.lastName || ""}`.trim(),
                    relationship: client1Executors[0]?.relationship || "",
                    address: clientDetails?.address || "",
                    executorType: "joint",
                  },
                ],
                client2Executors: [
                  {
                    ...initialExecutor,
                    title: clientDetails?.title2 || clientDetails?.title || "",
                    fullName:
                      `${clientDetails?.firstName2 || ""} ${clientDetails?.lastName2 || ""}`.trim(),
                    relationship: client2Executors[0]?.relationship || "",
                    address: clientDetails?.address || "",
                    executorType: "joint",
                  },
                ],
              }
            : {}),
        });
      }

      // Update refs
      prevExecutorsRef.current = {
        client1: currentClient1Str,
        client2: currentClient2Str,
        nomination: currentNomination,
      };

      // Reset flag after update
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clientsNominatingEachOther,
    client1Executors,
    client2Executors,
    hasTwoClients,
    sameAsClient1,
  ]); // Removed willInstructions and clientDetails from deps

  // Handler for client 1's executors
  const handleAddExecutor = (clientNumber) => {
    if (clientNumber === 1) {
      const updatedExecutors = [...client1Executors, { ...initialExecutor }];
      setClient1Executors(updatedExecutors);
    } else if (hasTwoClients) {
      const updatedExecutors = [...client2Executors, { ...initialExecutor }];
      setClient2Executors(updatedExecutors);
    }
  };

  const handleRemoveExecutor = (index, clientNumber) => {
    if (clientNumber === 1) {
      if (client1Executors.length === 1) return;
      const newExecutors = [...client1Executors];
      newExecutors.splice(index, 1);
      setClient1Executors(newExecutors);
    } else if (hasTwoClients) {
      if (client2Executors.length === 1) return;
      const newExecutors = [...client2Executors];
      newExecutors.splice(index, 1);
      setClient2Executors(newExecutors);
    }
  };

  const handleExecutorChange = (index, updatedExecutor, clientNumber) => {
    console.log("=== EXECUTOR CHANGE DEBUG ===");
    console.log("Index:", index);
    console.log("Client Number:", clientNumber);
    console.log("Updated Executor:", updatedExecutor);
    console.log("Current client1Executors:", client1Executors);
    console.log("Current client2Executors:", client2Executors);

    if (clientNumber === 1) {
      const newExecutors = [...client1Executors];
      newExecutors[index] = updatedExecutor;
      console.log("Setting client1Executors to:", newExecutors);
      setClient1Executors(newExecutors);
    } else if (hasTwoClients) {
      const newExecutors = [...client2Executors];
      newExecutors[index] = updatedExecutor;
      console.log("Setting client2Executors to:", newExecutors);
      setClient2Executors(newExecutors);
    }

    // Re-validate after update
    validateExecutors();
  };

  return (
    <div className="bg-[#F7F9FB] rounded-2xl border border-gray-200 p-4 md:p-6 flex flex-col gap-6">
      <div className="mb-6">
        <h3 className="text-[14px] md:text-lg font-semibold text-gray-900 mb-1">
          Executors
        </h3>
        <p className="text-xs md:text-sm text-gray-500">
          The person(s) you name as an executor will be responsible for carrying
          out the terms of your will
        </p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {hasTwoClients && (
          <div className="bg-white shadow-sm rounded-lg p-4 md:p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <FiUserCheck className="h-3 w-3 md:h-5 md:w-5" />
              </div>
              <h3 className="text-[13px] md:text-lg font-semibold text-gray-900">
                Executor Nomination
              </h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs md:text-sm text-gray-600">
                Are the clients nominating each other as executors?
              </p>
              <div className="flex items-center space-x-6">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      className="w-3 h-3 md:h-4 md:w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={
                        clientsNominatingEachOther === option.toLowerCase()
                      }
                      onChange={() =>
                        setClientsNominatingEachOther(option.toLowerCase())
                      }
                    />
                    <span className="text-xs md:text-sm font-medium text-gray-700">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              {clientsNominatingEachOther === "yes" && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-xs md:text-sm text-blue-700">
                    {clientDetails?.firstName || "Client 1"}{" "}
                    {clientDetails?.lastName || ""} and{" "}
                    {clientDetails?.firstName2 || "Client 2"}{" "}
                    {clientDetails?.lastName2 || ""} will be automatically added
                    as executors.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client 1 Executors */}
        <div className="bg-white shadow-sm rounded-lg p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-start md:items-center mb-6">
            <h3 className="text-[13px] md:text-lg font-semibold text-gray-900">
              {hasTwoClients
                ? `${clientDetails?.firstName || "Client 1"}'s Executors`
                : "Executors"}
            </h3>
            <button
              type="button"
              onClick={() => handleAddExecutor(1)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[13px] md:text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FiPlus size={18} />
              Add Executor
            </button>
          </div>

          <div className="space-y-6">
            {client1Executors.map((executor, index) => (
              <ExecutorForm
                key={`client1-${index}`}
                executor={executor}
                onRemove={() => handleRemoveExecutor(index, 1)}
                onChange={(updatedExecutor) =>
                  handleExecutorChange(index, updatedExecutor, 1)
                }
                showRemoveButton={client1Executors.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Client 2 Executors - Only show if there are two clients */}
        {hasTwoClients && (
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-2 md:gap-0 justify-between items-start md:items-center mb-6">
              <h3 className="text-[14px] md:text-lg font-semibold text-gray-900">
                {clientDetails?.firstName2 || "Client 2"}'s Executors
              </h3>
              {!sameAsClient1 && (
                <button
                  type="button"
                  onClick={() => handleAddExecutor(2)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[13px] md:text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <FiPlus size={18} />
                  Add Executor
                </button>
              )}
            </div>

            {/* Same as Client 1 Option */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3 h-3 md:h-5 md:w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={sameAsClient1}
                  onChange={(e) => setSameAsClient1(e.target.checked)}
                />
                <span className="text-[10px] md:text-sm font-medium text-gray-700">
                  Same as Client 1's Executors
                </span>
              </label>
              {sameAsClient1 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-xs md:text-sm text-blue-700">
                    Client 2 will have the same executors as Client 1.
                  </p>
                </div>
              )}
            </div>

            {!sameAsClient1 && (
              <div className="space-y-6">
                {client2Executors.map((executor, index) => (
                  <ExecutorForm
                    key={`client2-${index}`}
                    executor={executor}
                    onRemove={() => handleRemoveExecutor(index, 2)}
                    onChange={(updatedExecutor) =>
                      handleExecutorChange(index, updatedExecutor, 2)
                    }
                    showRemoveButton={client2Executors.length > 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Executers;
