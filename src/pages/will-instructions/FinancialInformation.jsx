import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAppContext } from "../../context/AppContext";

const ASSET_ROWS = [
  "Main residence",
  "Bank accounts/savings",
  "Investments (stocks/shares)",
  "Business assets",
  "Other property",
  "Pensions",
  "Life insurance (not in trust)",
  "Other",
];

const LIABILITY_ROWS = ["Mortgage", "Loans", "Other debts"];

const emptyMoneyRow = () => ({ joint: "", c1: "", c2: "" });

const formatMoney = (value) =>
  `£${(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

// Small, focused table component to keep the main JSX easier to read.
const MoneyTable = ({ heading, rows, onChange, totals }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
    <h4 className="font-semibold text-[#1a202c]">{heading}</h4>
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700 border-b border-r">
              {heading === "Assets" ? "Asset Type" : "Liability Type"}
            </th>
            <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b border-r">
              Joint (£)
            </th>
            <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700 border-b border-r">
              Client 1 (£)
            </th>
            <th className="px-4 py-3 text-center text-[10px] md:text-sm font-semibold text-gray-700 border-b">
              Client 2 (£)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className="odd:bg-white even:bg-gray-50">
              <td className="px-4 py-3 text-xs md:text-sm border-t border-r align-middle text-gray-800">
                {row.label}
              </td>
              {["joint", "c1", "c2"].map((field) => (
                <td
                  key={field}
                  className="px-3 py-2 border-t border-r last:border-r-0 align-middle"
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-sm"
                    value={row[field]}
                    onChange={(e) => onChange(index, field, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}

          {/* Totals row */}
          <tr className="bg-gray-50">
            <td className="px-4 py-3 text-xs md:text-sm border-t border-r font-semibold text-gray-900">
              {heading === "Assets" ? "Total Assets" : "Total Liabilities"}
            </td>
            <td className="px-4 py-3  text-xs md:text-smborder-t border-r text-center font-semibold text-gray-900">
              {formatMoney(totals.joint)}
            </td>
            <td className="px-4 py-3 border-t border-r text-center font-semibold text-gray-900">
              {formatMoney(totals.c1)}
            </td>
            <td className="px-4 py-3 border-t text-center font-semibold text-gray-900">
              {formatMoney(totals.c2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const FinancialInformation = () => {
  const { willInstructions, updateState } = useAppContext();
  
  // Initialize state with saved data or defaults
  const [hasForeignProperty, setHasForeignProperty] = useState(() =>
    willInstructions.financialInfo?.hasForeignProperty || false
  );
  const [foreignLocation, setForeignLocation] = useState(() =>
    willInstructions.financialInfo?.foreignLocation || ""
  );
  const [hasForeignWill, setHasForeignWill] = useState(() =>
    willInstructions.financialInfo?.hasForeignWill || false
  );
  const [mentionInThisWill, setMentionInThisWill] = useState(() =>
    willInstructions.financialInfo?.mentionInThisWill || false
  );

  const [assets, setAssets] = useState(() =>
    willInstructions.financialInfo?.assets || 
    ASSET_ROWS.map((label) => ({ label, ...emptyMoneyRow() }))
  );
  const [liabilities, setLiabilities] = useState(() =>
    willInstructions.financialInfo?.liabilities || 
    LIABILITY_ROWS.map((label) => ({ label, ...emptyMoneyRow() }))
  );

  // Track previous values to prevent unnecessary updates
  const prevFinancialInfoRef = useRef(JSON.stringify({
    hasForeignProperty,
    foreignLocation,
    hasForeignWill,
    mentionInThisWill,
    assets,
    liabilities
  }));
  const isInternalUpdate = useRef(false);
  const prevContextData = useRef(JSON.stringify(willInstructions.financialInfo));

  // Sync from context only when context changes externally (not from our updates)
  useEffect(() => {
    const currentContextData = JSON.stringify(willInstructions.financialInfo);
    
    // Only sync if context changed and it wasn't from our internal update
    if (currentContextData !== prevContextData.current && !isInternalUpdate.current) {
      const financialInfo = willInstructions.financialInfo || {};
      if (financialInfo.hasForeignProperty !== undefined) setHasForeignProperty(financialInfo.hasForeignProperty);
      if (financialInfo.foreignLocation !== undefined) setForeignLocation(financialInfo.foreignLocation);
      if (financialInfo.hasForeignWill !== undefined) setHasForeignWill(financialInfo.hasForeignWill);
      if (financialInfo.mentionInThisWill !== undefined) setMentionInThisWill(financialInfo.mentionInThisWill);
      if (financialInfo.assets) setAssets(financialInfo.assets);
      if (financialInfo.liabilities) setLiabilities(financialInfo.liabilities);
      prevContextData.current = currentContextData;
      prevFinancialInfoRef.current = currentContextData;
    }
    
    // Reset the flag after context update completes
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      prevContextData.current = currentContextData;
    }
  }, [willInstructions.financialInfo]);

  // Update context when any financial data changes
  useEffect(() => {
    const currentFinancialInfo = {
      hasForeignProperty,
      foreignLocation,
      hasForeignWill,
      mentionInThisWill,
      assets,
      liabilities
    };
    const currentStr = JSON.stringify(currentFinancialInfo);
    const prevStr = prevFinancialInfoRef.current;
    
    // Only update if data actually changed
    if (currentStr !== prevStr && !isInternalUpdate.current) {
      isInternalUpdate.current = true;
      const currentWillInstructions = willInstructions || {};
      updateState('willInstructions', {
        ...currentWillInstructions,
        financialInfo: currentFinancialInfo
      });
      prevFinancialInfoRef.current = currentStr;
      
      // Reset flag after update
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasForeignProperty, foreignLocation, hasForeignWill, mentionInThisWill, assets, liabilities]); // Removed willInstructions from deps

  const handleMoneyChange = (type, index, field, value) => {
    const numeric = value.replace(/[^\d.]/g, "");
    const setRows = type === "asset" ? setAssets : setLiabilities;
    const updateFn = (prevRows) => {
      const updated = prevRows.map((row, i) =>
        i === index ? { ...row, [field]: numeric } : row
      );
      return updated;
    };
    
    setRows(updateFn);
  };

  const sumColumn = (rows, field) =>
    rows.reduce((total, row) => total + (parseFloat(row[field]) || 0), 0);

  const assetTotals = useMemo(
    () => ({
      joint: sumColumn(assets, "joint"),
      c1: sumColumn(assets, "c1"),
      c2: sumColumn(assets, "c2"),
    }),
    [assets]
  );

  const liabilityTotals = useMemo(
    () => ({
      joint: sumColumn(liabilities, "joint"),
      c1: sumColumn(liabilities, "c1"),
      c2: sumColumn(liabilities, "c2"),
    }),
    [liabilities]
  );

  const netEstate = {
    joint: assetTotals.joint - liabilityTotals.joint,
    c1: assetTotals.c1 - liabilityTotals.c1,
    c2: assetTotals.c2 - liabilityTotals.c2,
  };

  const totalEstateValue = netEstate.joint + netEstate.c1 + netEstate.c2;

  return (
    <section className="bg-[#F7F9FB] rounded-2xl border border-gray-200 p-4 md:p-6 flex flex-col gap-6">
      {/* Section header */}
      <h2 className="text-[18px] md:text-xl font-semibold text-[#1a202c]">
        Financial Information
      </h2>

      {/* Inner green card */}
      <div className="bg-[#ECFFF4] border border-[#BBF7D0] rounded-2xl p-3 md:p-6 flex flex-col gap-6">
        {/* Inner header */}
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] md:text-lg font-semibold text-[#1a202c]">
            Financial Information
          </h3>
          <p className="text-xs md:text-sm text-gray-600">
            Estate planning financial details
          </p>
        </div>

        {/* Foreign Property */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-5 flex flex-col gap-4">
          <h4 className="font-semibold text-sm md:text-[16px] text-[#1a202c]">Foreign Property</h4>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-3 w-3 md:h-5 md:w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={hasForeignProperty}
              onChange={(e) => setHasForeignProperty(e.target.checked)}
            />
            <span className="text-[12px] md:text-base text-[#1a202c] font-medium">
              Do the clients own any foreign property?
            </span>
          </label>

          {hasForeignProperty && (
            <div className="bg-[#EDF5FF] border border-[#D9E8FF] rounded-xl p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs md:text-sm font-semibold text-[#1a202c]">
                  Where is the foreign property located?
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country/Location"
                  value={foreignLocation}
                  onChange={(e) => setForeignLocation(e.target.value)}
                  onBlur={() => {
                    updateState('willInstructions', {
                      ...willInstructions,
                      financialInfo: {
                        ...willInstructions.financialInfo,
                        foreignLocation
                      }
                    });
                  }}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={hasForeignWill}
                  onChange={(e) => setHasForeignWill(e.target.checked)}
                />
                <span className="text-xs md:text-base text-[#1a202c] font-medium">
                  Is there a will in that country?
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={mentionInThisWill}
                  onChange={(e) => setMentionInThisWill(e.target.checked)}
                />
                <span className="text-xs md:text-base text-[#1a202c] font-medium">
                  Mention in this will?
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Assets table */}
        <MoneyTable
          heading="Assets"
          rows={assets}
          totals={assetTotals}
          onChange={(index, field, value) =>
            handleMoneyChange("asset", index, field, value)
          }
        />

        <MoneyTable
          heading="Liabilities"
          rows={liabilities}
          totals={liabilityTotals}
          onChange={(index, field, value) =>
            handleMoneyChange("liability", index, field, value)
          }
        />

        {/* Net estate summary */}
        <div className="bg-[#E5F0FF] rounded-2xl border border-[#BFDBFE] p-6 flex flex-col gap-6">
          <h4 className="font-semibold text-[#1a202c]">Net Estate</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Joint Net Estate</p>
              <p className="text-2xl font-bold text-[#1a202c]">
                {formatMoney(netEstate.joint)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Client 1 Net Estate</p>
              <p className="text-2xl font-bold text-[#1a202c]">
                {formatMoney(netEstate.c1)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Client 2 Net Estate</p>
              <p className="text-2xl font-bold text-[#1a202c]">
                {formatMoney(netEstate.c2)}
              </p>
            </div>
          </div>

          <hr className="border-blue-100 my-2" />

          <div className="text-center flex flex-col gap-2">
            <p className="text-base font-semibold text-[#1a202c]">
              Total Estate Value
            </p>
            <p className="text-3xl font-extrabold text-[#0080FF]">
              {formatMoney(totalEstateValue)}
            </p>
            <p className="text-sm text-gray-600">
              Combined net estate of all parties
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinancialInformation;
