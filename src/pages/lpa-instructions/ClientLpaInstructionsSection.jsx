import React, { useState, useEffect } from "react";
import { FiCopy } from "react-icons/fi";
import Input from "../../components/Input";
import ClientAttorneysSection from "./ClientAttorneysSection";
import { useAppContext } from "../../context/AppContext";

const ClientLpaInstructionsSection = () => {
  const { lpaInstructions, updateState } = useAppContext();
  const [activeTab, setActiveTab] = useState("property");
  const [activeClient, setActiveClient] = useState("client1");
  
  // Extract values from context or use defaults
  const {
    preferences = "",
    certificateProvider = "",
    certificateProviderDetails = "",
    decisionTiming = "",
    storeOrRegister = "",
    awareOfFee = false,
    propertyAttorneys = [],
    healthAttorneys = [],
    propertyReplacementAttorneys = [],
    healthReplacementAttorneys = []
  } = lpaInstructions[activeClient] || {};

  // Get client 2 data if exists
  const client2Data = lpaInstructions.client2 || {
    preferences: "",
    certificateProvider: "",
    certificateProviderDetails: "",
    decisionTiming: "",
    storeOrRegister: "",
    awareOfFee: false,
    propertyAttorneys: [],
    healthAttorneys: [],
    propertyReplacementAttorneys: [],
    healthReplacementAttorneys: []
  };

  // Update context when state changes
  const updateClientData = (updates) => {
    updateState('lpaInstructions', {
      ...lpaInstructions,
      [activeClient]: {
        ...(lpaInstructions[activeClient] || {}),
        ...updates
      }
    });
  };

  // Copy attorneys from property to health for current client
  const copyPropertyToHealthAttorneys = () => {
    if (window.confirm('Are you sure you want to copy Property & Financial attorneys to Health & Welfare?')) {
      updateClientData({
        healthAttorneys: JSON.parse(JSON.stringify(propertyAttorneys)),
        healthReplacementAttorneys: JSON.parse(JSON.stringify(propertyReplacementAttorneys))
      });
    }
  };

  // Copy all data from client 1 to client 2
  const copyClient1ToClient2 = () => {
    if (window.confirm('Are you sure you want to copy all information from Client 1 to Client 2?')) {
      updateState('lpaInstructions', {
        ...lpaInstructions,
        client2: JSON.parse(JSON.stringify(lpaInstructions.client1 || {}))
      });
    }
  };

  // Handler functions that update the context
  const handlePreferencesChange = (e) => {
    updateClientData({ preferences: e.target.value });
  };

  const handleCertificateProviderChange = (value) => {
    updateClientData({ certificateProvider: value });
  };

  const handleCertificateProviderDetailsChange = (e) => {
    updateClientData({ certificateProviderDetails: e.target.value });
  };

  const handleDecisionTimingChange = (value) => {
    updateClientData({ decisionTiming: value });
  };

  const handleStoreOrRegisterChange = (value) => {
    updateClientData({ storeOrRegister: value });
  };

  const handleAwareOfFeeChange = (e) => {
    updateClientData({ awareOfFee: e.target.checked });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Client Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <h3 className="sr-only">Client Selection</h3>
        <button
          className={`px-4 py-2 font-medium ${
            activeClient === "client1"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveClient("client1")}
        >
          Client 1
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeClient === "client2"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveClient("client2")}
        >
          Client 2
        </button>
        {activeClient === "client2" && (
          <button
            className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            onClick={copyClient1ToClient2}
            type="button"
          >
            <FiCopy className="w-4 h-4" />
            Copy from Client 1
          </button>
        )}
      </div>

      {/* LPA Type Tabs */}
      <div className="flex border-b border-gray-200">
        <h3 className="sr-only">LPA Type Selection</h3>
        <button
          className={`px-4 py-2  font-medium ${
            activeTab === "property"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("property")}
        >
          Property & Financial
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "health"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("health")}
        >
          Health & Welfare
        </button>
        {activeTab === "health" && propertyAttorneys.length > 0 && (
          <button
            className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            onClick={copyPropertyToHealthAttorneys}
            type="button"
          >
            <FiCopy className="w-4 h-4" />
            Copy from Property & Financial
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-b-lg rounded-r-lg p-6 flex flex-col gap-6">
        <ClientAttorneysSection 
          activeTab={activeTab}
          propertyAttorneys={propertyAttorneys}
          healthAttorneys={healthAttorneys}
          propertyReplacementAttorneys={propertyReplacementAttorneys}
          healthReplacementAttorneys={healthReplacementAttorneys}
          onUpdateAttorneys={(type, attorneys) => updateClientData({ [type]: attorneys })}
        />

        {/* Preferences/Instructions Section */}
        <div className="space-y-2">
          <Input
            label="Preferences/Instructions"
            type="textarea"
            value={preferences}
            onChange={handlePreferencesChange}
            placeholder="Enter preferences or instructions..."
            rows={4}
            maxLength={400}
          />
          <div className="flex justify-end items-center mt-1">
            <span className="text-xs text-gray-500">
              {preferences.length}/400 characters
            </span>
          </div>
        </div>

        {/* General LPA Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-[#2D3748]">
            General LPA Information
          </h3>

          {/* Question 1: Certificate Provider */}
          <div className="space-y-3">
            <p className="text-[#2D3748] font-medium">
              Is advisor acting as certificate provider?
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="certificateProvider"
                  className="w-4 h-4"
                  checked={certificateProvider === "yes"}
                  onChange={() => handleCertificateProviderChange("yes")}
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="certificateProvider"
                  className="w-4 h-4"
                  checked={certificateProvider === "no"}
                  onChange={() => handleCertificateProviderChange("no")}
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
            
            {/* Certificate Provider Details - Show when "No" is selected */}
            {certificateProvider === "no" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Input
                  label="Certificate Provider Details"
                  type="textarea"
                  value={certificateProviderDetails || ''}
                  onChange={handleCertificateProviderDetailsChange}
                  placeholder="Enter details of certificate provider..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Question 2: Decision Timing */}
          <div className="space-y-3">
            <p className="text-[#2D3748] font-medium">
              When do you want attorneys to be able to make decisions?
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decisionTiming"
                  className="w-4 h-4"
                  checked={decisionTiming === "registered"}
                  onChange={() => handleDecisionTimingChange("registered")}
                />
                <span className="text-gray-700">
                  As soon as LPA is registered
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="decisionTiming"
                  className="w-4 h-4"
                  checked={decisionTiming === "capacity"}
                  onChange={() => handleDecisionTimingChange("capacity")}
                />
                <span className="text-gray-700">
                  Only if I lose mental capacity
                </span>
              </label>
            </div>
          </div>

          {/* Question 3: Store or Register */}
          <div className="space-y-3">
            <p className="text-[#2D3748] font-medium">
              Do clients want to store or register their LPAs?
            </p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storeOrRegister"
                  className="w-4 h-4"
                  checked={storeOrRegister === "store"}
                  onChange={() => handleStoreOrRegisterChange("store")}
                />
                <span className="text-gray-700">Store</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="storeOrRegister"
                  className="w-4 h-4"
                  checked={storeOrRegister === "register"}
                  onChange={() => handleStoreOrRegisterChange("register")}
                />
                <span className="text-gray-700">Register</span>
              </label>
            </div>
          </div>

          {/* OPG Registration Fee Checkbox */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={awareOfFee}
                onChange={handleAwareOfFeeChange}
              />
              <span className="text-red-500 font-medium">
                Is the client aware of the OPG registration fee?
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLpaInstructionsSection;
