import React, { useEffect, useState, useRef } from "react";
import { FiFileText } from "react-icons/fi";
import ChildrenForm from "./ChildrenForm";
import FinancialInformation from "./FinancialInformation";
import Executers from "./Executers";
import Bequests from "./Bequests";
import PropertyTrush from "./PropertyTrush";
import Residue from "./Residue";
import FuneralWishes from "./FuneralWishes";
import BusinessTrust from "./BusinessTrust";
import TestamentaryCapacity from "./TestamentaryCapacity";
import Input from "../../components/Input";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const MainWillInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { willInstructions = {}, updateState } = useAppContext();

  const [additionalInstructions, setAdditionalInstructions] = useState(
    willInstructions?.additionalInstructions || ""
  );
  const [isChildrenFormValid, setIsChildrenFormValid] = useState(true);
  const [isExecutorsFormValid, setIsExecutorsFormValid] = useState(true);
  const isInternalUpdate = useRef(false);
  const prevContextValue = useRef(JSON.stringify(willInstructions?.additionalInstructions));

  const handleNext = () => {
    navigate("/lpa-instructions");
  };

  // Sync local state from context only when context changes externally (not from our updates)
  useEffect(() => {
    const currentContextValue = JSON.stringify(willInstructions?.additionalInstructions);
    
    // Only sync if context changed and it wasn't from our internal update
    if (currentContextValue !== prevContextValue.current && !isInternalUpdate.current) {
      setAdditionalInstructions(willInstructions?.additionalInstructions || "");
      prevContextValue.current = currentContextValue;
    }
    
    // Reset the flag after context update completes
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      prevContextValue.current = currentContextValue;
    }
  }, [willInstructions?.additionalInstructions]);

  // Smooth scroll logic - trigger when hash or pathname changes
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const element = document.getElementById(targetId);

      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          const scrollContainer = element.closest(".overflow-y-auto");
          if (scrollContainer) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            scrollContainer.scrollTop =
              elementRect.top -
              containerRect.top +
              scrollContainer.scrollTop -
              20;
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, location.pathname]);

  // Update context when additionalInstructions changes (debounced to prevent excessive updates)
  useEffect(() => {
    const currentFormValue = JSON.stringify(additionalInstructions);
    const currentContextValue = prevContextValue.current;
    
    // Only update if formData differs from context (user made a change)
    if (currentFormValue !== currentContextValue) {
      isInternalUpdate.current = true;
      
      // Debounce the update to prevent excessive context updates while typing
      const timeoutId = setTimeout(() => {
        // Get current willInstructions from context at the time of update
        const currentWillInstructions = willInstructions || {};
        updateState("willInstructions", {
          ...currentWillInstructions,
          additionalInstructions,
        });
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalInstructions]); // Only depend on additionalInstructions to prevent loops

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6 flex flex-col gap-6">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <FiFileText size={26} className="text-[#0080FF] w-5 h-5 md:w-6 md:h-6" />
          <h2 className="text-[20px] md:text-[24px] font-semibold text-[#1a202c]">
            Will Instructions
          </h2>
        </div>
        <p className="text-gray-500 text-xs md:text-sm">
          Specify executors, beneficiaries, and will instructions.
        </p>
      </div>

      <div id="children">
        <ChildrenForm onValidationChange={setIsChildrenFormValid} />
      </div>
      <div id="financial-information">
        <FinancialInformation />
      </div>
      <div id="funeral-wishes">
        <FuneralWishes />
      </div>
      <div id="executors">
        <Executers onValidationChange={setIsExecutorsFormValid} />
      </div>
      <div id="legacies-bequests">
        <Bequests />
      </div>
      <div id="property-trusts-roo">
        <PropertyTrush />
      </div>
      <div id="residue">
        <Residue />
      </div>
      <div id="business-trust">
        <BusinessTrust />
      </div>
      <div id="testamentary-capacity">
        <TestamentaryCapacity />
      </div>

      <div
        id="additional-instructions"
        className="bg-white rounded-xl border border-gray-200 p-3 md:p-6 flex flex-col gap-6"
      >
        <div>
          <h3 className="text-[16px] md:text-xl font-bold text-[#2D3748]">
            Additional Instructions
          </h3>
        </div>
        <div className="space-y-2">
          <h4 className="text-[14px] md:text-lg font-semibold text-[#1a202c]">
            Additional Instructions
          </h4>
          <Input
            type="textarea"
            value={additionalInstructions}
            onChange={(e) => {
              const newValue = e.target.value;
              setAdditionalInstructions(newValue);
              
              // Immediate update to context on change for better persistence
              isInternalUpdate.current = true;
              updateState("willInstructions", {
                ...willInstructions,
                additionalInstructions: newValue,
              });
            }}
            placeholder="Any additional instructions or wishes..."
            rows={5}
            maxLength={500}
          />
          <div className="flex justify-end items-center mt-1">
            <span className="text-xs text-gray-500">
              {additionalInstructions.length}/500 characters
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/client-details")}
            type="button"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            type="button"
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors bg-[#0080FF] text-white hover:bg-[#0070e6]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainWillInstructions;
