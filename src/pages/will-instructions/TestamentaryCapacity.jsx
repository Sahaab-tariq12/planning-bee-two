import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/AppContext";

const initialTestamentaryCapacity = {
  hasLPAs: "",
  hasConcerns: "",
  understandsInstructions: "",
  understandsClaims: "",
  notUndulyInfluenced: "",
  paralegalCertification: false,
};

const TestamentaryCapacity = () => {
  const { willInstructions, updateState } = useAppContext();
  const [formData, setFormData] = useState(() => 
    willInstructions.testamentaryCapacity || initialTestamentaryCapacity
  );
  const isInternalUpdate = useRef(false);
  const prevContextData = useRef(JSON.stringify(willInstructions.testamentaryCapacity));

  // Sync from context only when context changes externally (not from our updates)
  useEffect(() => {
    const currentContextData = JSON.stringify(willInstructions.testamentaryCapacity);
    
    // Only sync if context changed and it wasn't from our internal update
    if (currentContextData !== prevContextData.current && !isInternalUpdate.current) {
      setFormData(willInstructions.testamentaryCapacity || initialTestamentaryCapacity);
      prevContextData.current = currentContextData;
    }
    
    // Reset the flag after context update completes
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      prevContextData.current = currentContextData;
    }
  }, [willInstructions.testamentaryCapacity]);

  // Update context only when formData changes from user interaction
  useEffect(() => {
    const currentFormData = JSON.stringify(formData);
    const currentContextData = JSON.stringify(willInstructions.testamentaryCapacity);
    
    // Only update if formData differs from context (user made a change)
    if (currentFormData !== currentContextData) {
      isInternalUpdate.current = true;
      updateState('willInstructions', { 
        ...willInstructions, 
        testamentaryCapacity: formData 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]); // Removed updateState and willInstructions from deps to prevent infinite loop

  const handleRadioChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (e) => {
    setFormData(prev => ({ ...prev, paralegalCertification: e.target.checked }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 flex flex-col gap-3 md:gap-6">
      {/* Header */}
      <div>
        <h3 className="text-[16px] md:text-xl font-bold text-[#2D3748]">Testamentary Capacity ok</h3>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        {/* Question 1 */}
        <div className="space-y-3">
          <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
            Do client have LPAs?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasLPAs"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.hasLPAs === "yes"}
                onChange={() => handleRadioChange("hasLPAs", "yes")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasLPAs"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.hasLPAs === "no"}
                onChange={() => handleRadioChange("hasLPAs", "no")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>

        {/* Question 2 */}
        <div className="space-y-3">
          <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
            Do you have concerns in respect of capacity, confusion, memory loss?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasConcerns"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.hasConcerns === "yes"}
                onChange={() => handleRadioChange("hasConcerns", "yes")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasConcerns"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.hasConcerns === "no"}
                onChange={() => handleRadioChange("hasConcerns", "no")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>

        {/* Question 3 */}
        <div className="space-y-3">
          <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
            Are you satisfied that the Clients understand they are giving
            instructions for their Will?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="understandsInstructions"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.understandsInstructions === "yes"}
                onChange={() =>
                  handleRadioChange("understandsInstructions", "yes")
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="understandsInstructions"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.understandsInstructions === "no"}
                onChange={() =>
                  handleRadioChange("understandsInstructions", "no")
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>

        {/* Question 4 */}
        <div className="space-y-3">
          <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
            Are you satisfied that the Clients understand who may have a claim
            on their estate?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="understandsClaims"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.understandsClaims === "yes"}
                onChange={() => handleRadioChange("understandsClaims", "yes")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="understandsClaims"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.understandsClaims === "no"}
                onChange={() => handleRadioChange("understandsClaims", "no")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>

        {/* Question 5 */}
        <div className="space-y-3">
          <p className="font-semibold text-[14px] md:text-[16px] text-[#2D3748]">
            Are you satisfied that the clients aren't being unduly influenced?
          </p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="notUndulyInfluenced"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.notUndulyInfluenced === "yes"}
                onChange={() =>
                  handleRadioChange("notUndulyInfluenced", "yes")
                }
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="notUndulyInfluenced"
                className="w-3 h-3 md:w-4 md:h-4"
                checked={formData.notUndulyInfluenced === "no"}
                onChange={() => handleRadioChange("notUndulyInfluenced", "no")}
              />
              <span className="text-gray-700 text-[14px] md:text-[16px]">No</span>
            </label>
          </div>
        </div>
      </div>

      {/* Paralegal Certification Checkbox */}
      <div className="bg-[#E6F2FF] rounded-lg border border-[#B3D9FF] p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={formData.paralegalCertification}
            onChange={handleCheckboxChange}
          />
          <span className="text-xs md:text-sm text-gray-700">
            By ticking this box the Paralegal certifies the clients testamentary
            capacity
          </span>
        </label>
      </div>
    </div>
  );
};

export default TestamentaryCapacity;
