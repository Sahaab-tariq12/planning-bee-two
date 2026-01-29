import React, { useState, useEffect, useRef } from "react";
import Input from "../../components/Input";
import { useAppContext } from "../../context/AppContext";

const FuneralWishes = () => {
  const { willInstructions, updateState } = useAppContext();
  const [client1Wishes, setClient1Wishes] = useState(() =>
    willInstructions.funeralWishes?.client1Wishes || {
      cremation: false,
      burial: false,
      undecided: false,
      other: false,
    }
  );
  const [client1Other, setClient1Other] = useState(() =>
    willInstructions.funeralWishes?.client1Other || ""
  );
  const [client2Wishes, setClient2Wishes] = useState(() =>
    willInstructions.funeralWishes?.client2Wishes || {
      cremation: false,
      burial: false,
      undecided: false,
      other: false,
    }
  );
  const [client2Other, setClient2Other] = useState(() =>
    willInstructions.funeralWishes?.client2Other || ""
  );
  const [additionalWishes, setAdditionalWishes] = useState(() =>
    willInstructions.funeralWishes?.additionalWishes || ""
  );

  // Track previous values to prevent unnecessary updates
  const prevFuneralWishesRef = useRef(JSON.stringify({
    client1Wishes,
    client1Other,
    client2Wishes,
    client2Other,
    additionalWishes
  }));
  const isInternalUpdate = useRef(false);
  const prevContextData = useRef(JSON.stringify(willInstructions.funeralWishes));

  // Sync from context only when context changes externally (not from our updates)
  useEffect(() => {
    const currentContextData = JSON.stringify(willInstructions.funeralWishes);
    
    // Only sync if context changed and it wasn't from our internal update
    if (currentContextData !== prevContextData.current && !isInternalUpdate.current) {
      const funeralWishes = willInstructions.funeralWishes || {};
      if (funeralWishes.client1Wishes) setClient1Wishes(funeralWishes.client1Wishes);
      if (funeralWishes.client1Other !== undefined) setClient1Other(funeralWishes.client1Other);
      if (funeralWishes.client2Wishes) setClient2Wishes(funeralWishes.client2Wishes);
      if (funeralWishes.client2Other !== undefined) setClient2Other(funeralWishes.client2Other);
      if (funeralWishes.additionalWishes !== undefined) setAdditionalWishes(funeralWishes.additionalWishes);
      prevContextData.current = currentContextData;
      prevFuneralWishesRef.current = currentContextData;
    }
    
    // Reset the flag after context update completes
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      prevContextData.current = currentContextData;
    }
  }, [willInstructions.funeralWishes]);

  // Update context when any funeral wish changes
  useEffect(() => {
    const currentFuneralWishes = {
      client1Wishes,
      client1Other,
      client2Wishes,
      client2Other,
      additionalWishes
    };
    const currentStr = JSON.stringify(currentFuneralWishes);
    const prevStr = prevFuneralWishesRef.current;
    
    // Only update if data actually changed
    if (currentStr !== prevStr && !isInternalUpdate.current) {
      isInternalUpdate.current = true;
      const currentWillInstructions = willInstructions || {};
      updateState('willInstructions', {
        ...currentWillInstructions,
        funeralWishes: currentFuneralWishes
      });
      prevFuneralWishesRef.current = currentStr;
      
      // Reset flag after update
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client1Wishes, client1Other, client2Wishes, client2Other, additionalWishes]); // Removed willInstructions from deps

  const handleClient1WishChange = (wish) => {
    const updatedWishes = {
      ...client1Wishes,
      [wish]: !client1Wishes[wish]
    };
    setClient1Wishes(updatedWishes);
  };

  const handleClient2WishChange = (wish) => {
    const updatedWishes = {
      ...client2Wishes,
      [wish]: !client2Wishes[wish]
    };
    setClient2Wishes(updatedWishes);
  };

  return (
    <div className="bg-[#F7F9FB] rounded-xl border border-gray-200 p-4 md:p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h3 className="text-[18px] md:text-xl font-bold text-[#2D3748]">Funeral Wishes</h3>
      </div>

      {/* Client 1 Funeral Wishes */}
      <div className=" rounded-lg flex flex-col gap-4">
        <h4 className="text-[14x] md:text-lg font-semibold text-[#1a202c]">
          Client 1 Funeral Wishes
        </h4>
        <div className="space-y-3">
          {["Cremation", "Burial", "Undecided"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={client1Wishes[option.toLowerCase()]}
                onChange={() => handleClient1WishChange(option.toLowerCase())}
              />
              <span className="text-gray-700 text-sm md:text-[16px]">{option}</span>
            </label>
          ))}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={client1Wishes.other}
                onChange={() => handleClient1WishChange("other")}
              />
              <span className="text-gray-700 text-sm md:text-[16px]">Other (specify below)</span>
            </label>
            {client1Wishes.other && (
              <div>
                <Input
                  type="text"
                  value={client1Other}
                  onChange={(e) => setClient1Other(e.target.value)}
                  onBlur={() => {
                    // Only update if value changed
                    const currentWillInstructions = willInstructions || {};
                    const currentFuneralWishes = currentWillInstructions.funeralWishes || {};
                    if (client1Other !== currentFuneralWishes.client1Other) {
                      isInternalUpdate.current = true;
                      updateState('willInstructions', {
                        ...currentWillInstructions,
                        funeralWishes: {
                          ...currentFuneralWishes,
                          client1Other
                        }
                      });
                    }
                  }}
                  placeholder="Specify other funeral wish"
                  className="ml-6"
                  maxLength={250}
                />
                <div className="flex justify-end items-center mt-1 ml-6">
                  <span className="text-xs text-gray-500">
                    {client1Other.length}/250 characters
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client 2 Funeral Wishes */}
      <div className=" rounded-lg flex flex-col gap-4">
        <h4 className="text-[14x] md:text-lg font-semibold text-[#1a202c]">
          Client 2 Funeral Wishes
        </h4>
        <div className="space-y-3">
          {["Cremation", "Burial", "Undecided"].map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={client2Wishes[option.toLowerCase()]}
                onChange={() => handleClient2WishChange(option.toLowerCase())}
              />
              <span className="text-gray-700 text-sm md:text-[16px]">{option}</span>
            </label>
          ))}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={client2Wishes.other}
                onChange={() => handleClient2WishChange("other")}
              />
              <span className="text-gray-700 text-sm md:text-[16px]">Other (specify below)</span>
            </label>
            {client2Wishes.other && (
              <div>
                <Input
                  type="text"
                  value={client2Other}
                  onChange={(e) => setClient2Other(e.target.value)}
                  onBlur={() => {
                    // Only update if value changed
                    const currentWillInstructions = willInstructions || {};
                    const currentFuneralWishes = currentWillInstructions.funeralWishes || {};
                    if (client2Other !== currentFuneralWishes.client2Other) {
                      isInternalUpdate.current = true;
                      updateState('willInstructions', {
                        ...currentWillInstructions,
                        funeralWishes: {
                          ...currentFuneralWishes,
                          client2Other
                        }
                      });
                    }
                  }}
                  placeholder="Specify other funeral wish"
                  className="ml-6"
                  maxLength={250}
                />
                <div className="flex justify-end items-center mt-1 ml-6">
                  <span className="text-xs text-gray-500">
                    {client2Other.length}/250 characters
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Funeral Wishes */}
      <div className=" flex flex-col gap-4">
        <h4 className="text-[14x] md:text-lg font-semibold text-[#1a202c]">
          Additional Funeral Wishes
        </h4>
        <Input
          type="textarea"
          rows={5}
          value={additionalWishes}
          onChange={(e) => setAdditionalWishes(e.target.value)}
          onBlur={() => {
            // Only update if value changed
            const currentWillInstructions = willInstructions || {};
            const currentFuneralWishes = currentWillInstructions.funeralWishes || {};
            if (additionalWishes !== currentFuneralWishes.additionalWishes) {
              isInternalUpdate.current = true;
              updateState('willInstructions', {
                ...currentWillInstructions,
                funeralWishes: {
                  ...currentFuneralWishes,
                  additionalWishes
                }
              });
            }
          }}
          placeholder="Please describe any additional specific funeral wishes..."
          maxLength={400}
        />
        <div className="flex justify-end items-center mt-1">
          <span className="text-xs text-gray-500">
            {additionalWishes.length}/400 characters
          </span>
        </div>
      </div>
    </div>
  );
};
export default FuneralWishes;
