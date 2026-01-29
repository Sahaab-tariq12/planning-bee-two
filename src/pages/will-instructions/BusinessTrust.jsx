import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";

export const initialBusinessTrust = {
  businessName: "",
  ownershipDetails: "",
  beneficiaries: [],
  trustTerms: ""
};

const BusinessTrust = () => {
  const { willInstructions, updateState } = useAppContext();
  const [businessTrusts, setBusinessTrusts] = useState(() => 
    willInstructions.businessTrusts || []
  );
  const isInternalUpdate = useRef(false);
  const prevContextData = useRef(JSON.stringify(willInstructions.businessTrusts));
  
  // Sync from context only when context changes externally (not from our updates)
  useEffect(() => {
    const currentContextData = JSON.stringify(willInstructions.businessTrusts);
    
    // Only sync if context changed and it wasn't from our internal update
    if (currentContextData !== prevContextData.current && !isInternalUpdate.current) {
      setBusinessTrusts(willInstructions.businessTrusts || []);
      prevContextData.current = currentContextData;
    }
    
    // Reset the flag after context update completes
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      prevContextData.current = currentContextData;
    }
  }, [willInstructions.businessTrusts]);
  
  // Update context only when businessTrusts changes from user interaction
  useEffect(() => {
    const currentFormData = JSON.stringify(businessTrusts);
    const currentContextData = JSON.stringify(willInstructions.businessTrusts);
    
    // Only update if formData differs from context (user made a change)
    if (currentFormData !== currentContextData) {
      isInternalUpdate.current = true;
      updateState('willInstructions', { 
        ...willInstructions, 
        businessTrusts 
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTrusts]); // Only depend on businessTrusts to prevent loops

  const handleAddBusinessTrust = () => {
    setBusinessTrusts([...businessTrusts, { ...initialBusinessTrust }]);
  };

  const handleRemoveBusinessTrust = (index) => {
    const newTrusts = [...businessTrusts];
    newTrusts.splice(index, 1);
    setBusinessTrusts(newTrusts);
  };

  const handleTrustChange = (index, field, value) => {
    const newTrusts = [...businessTrusts];
    newTrusts[index] = {
      ...newTrusts[index],
      [field]: value
    };
    setBusinessTrusts(newTrusts);
  };

  return (
    <div className="bg-[#F7F9FB] rounded-xl border border-gray-200 p-3 md:p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row text-start md:items-center gap-2 md:gap-0 justify-between">
        <div>
          <h3 className="text-[16px] md:text-xl font-bold text-[#2D3748]">Business Trusts</h3>
          <p className="text-xs md:text-sm text-gray-500">
            Set up trusts for business assets and ownership
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddBusinessTrust}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiPlus size={18} />
            Add Business Trust
          </button>
        </div>
      </div>

      {businessTrusts.length === 0 ? (
        <div className="mt-4 py-10 px-4 bg-white rounded-lg border border-dashed border-gray-300 text-center text-gray-500 text-sm">
          No business trusts added yet. Click "Add Business Trust" to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {businessTrusts.map((trust, index) => (
            <div key={index} className="bg-white p-3 md:p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Business Trust {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveBusinessTrust(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={trust.businessName || ''}
                    onChange={(e) => handleTrustChange(index, 'businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter business name"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700">
                    Power to carry on business
                  </label>
                  <textarea
                    value={trust.ownershipDetails || ''}
                    onChange={(e) => handleTrustChange(index, 'ownershipDetails', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the power to carry on business"
                    maxLength={400}
                  />
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {(trust.ownershipDetails || "").length}/400 characters
                    </span>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700">
                    Distribution and trustees if different from executors
                  </label>
                  <textarea
                    value={trust.trustTerms || ''}
                    onChange={(e) => handleTrustChange(index, 'trustTerms', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Specify distribution and trustees if different from executors"
                    maxLength={500}
                  />
                  <div className="flex justify-end items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {(trust.trustTerms || "").length}/500 characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessTrust;
