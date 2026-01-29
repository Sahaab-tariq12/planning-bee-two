import React, { useState } from "react";

const GeneralLpaInfoSection = () => {
  const [certificateProvider, setCertificateProvider] = useState("");
  const [decisionTiming, setDecisionTiming] = useState("");
  const [storeOrRegister, setStoreOrRegister] = useState("");
  const [awareOfFee, setAwareOfFee] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-6">
      <h3 className="text-xl font-bold text-[#2D3748]">General LPA Information</h3>

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
              onChange={() => setCertificateProvider("yes")}
            />
            <span className="text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="certificateProvider"
              className="w-4 h-4"
              checked={certificateProvider === "no"}
              onChange={() => setCertificateProvider("no")}
            />
            <span className="text-gray-700">No</span>
          </label>
        </div>
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
              onChange={() => setDecisionTiming("registered")}
            />
            <span className="text-gray-700">As soon as LPA is registered</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="decisionTiming"
              className="w-4 h-4"
              checked={decisionTiming === "capacity"}
              onChange={() => setDecisionTiming("capacity")}
            />
            <span className="text-gray-700">Only if I lose mental capacity</span>
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
              onChange={() => setStoreOrRegister("store")}
            />
            <span className="text-gray-700">Store</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="storeOrRegister"
              className="w-4 h-4"
              checked={storeOrRegister === "register"}
              onChange={() => setStoreOrRegister("register")}
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
            onChange={(e) => setAwareOfFee(e.target.checked)}
          />
          <span className="text-red-500 font-medium">
            Is the client aware of the OPG registration fee?
          </span>
        </label>
      </div>
    </div>
  );
};

export default GeneralLpaInfoSection;
