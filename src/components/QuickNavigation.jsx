// import { toast } from "react-hot-toast";
// import { generatePDF } from "../services/pdfService.js";
// import { useAppContext } from "../context/AppContext";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState, useMemo, useRef } from "react";
// import { FiChevronRight, FiChevronDown, FiFileText } from "react-icons/fi";

// const QuickNavigation = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const {
//     clientDetails,
//     willInstructions,
//     familyProtection,
//     lpaInstructions,
//     idInformation,
//     signatures,
//   } = useAppContext();

//   const [isWillOpen, setIsWillOpen] = useState(false);
//   const lastProcessedPath = useRef("");

//   const navItems = useMemo(
//     () => [
//       { name: "Client Details", path: "/client-details" },
//       {
//         name: "Will Instructions",
//         path: "/will-instructions",
//         hasSub: true,
//         subItems: [
//           { label: "Children", targetId: "children" },
//           { label: "Financial Information", targetId: "financial-information" },
//           { label: "Funeral Wishes", targetId: "funeral-wishes" },
//           { label: "Executors", targetId: "executors" },
//           { label: "Legacies/Bequests", targetId: "legacies-bequests" },
//           { label: "Property Trusts/ROO", targetId: "property-trusts-roo" },
//           { label: "Residue", targetId: "residue" },
//           { label: "Business Trust", targetId: "business-trust" },
//           { label: "Testamentary Capacity", targetId: "testamentary-capacity" },
//           {
//             label: "Additional Instructions",
//             targetId: "additional-instructions",
//           },
//         ],
//       },
//       { name: "LPA Instructions", path: "/lpa-instructions" },
//       {
//         name: "Family Protection Trust Instructions",
//         path: "/family-protection",
//       },
//       { name: "ID & Supporting Information", path: "/id-information" },
//       { name: "Review & Sign", path: "/review" },
//     ],
//     []
//   );

//   useEffect(() => {
//     const isWillPath = location.pathname === "/will-instructions";
//     setIsWillOpen(isWillPath);
//   }, [location.pathname]);

//   const activeNav =
//     navItems.find((item) => location.pathname === item.path)?.name ||
//     "Client Details";

//   const activeSubItem = location.hash.replace("#", "");

//   const handleNavClick = (item) => {
//     if (location.pathname === item.path && item.name === "Will Instructions") {
//       setIsWillOpen(!isWillOpen);
//       return;
//     }
//     if (item.path && location.pathname !== item.path) {
//       navigate(item.path, { replace: false });
//     }
//   };

//   const handleSubItemClick = (sub) => {
//     if (!location.pathname.includes("/will-instructions")) {
//       navigate(`/will-instructions#${sub.targetId}`, { replace: false });
//       setTimeout(() => {
//         const el = document.getElementById(sub.targetId);
//         if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//       }, 100);
//     } else {
//       window.history.replaceState(null, "", `#${sub.targetId}`);
//       const el = document.getElementById(sub.targetId);
//       if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   // Helper to get Initials (e.g., "Client Details" -> "CD")
//   const getInitials = (name) => {
//     const words = name.split(" ");
//     if (words.length > 1) {
//       return (words[0][0] + words[1][0]).toUpperCase();
//     }
//     return name.slice(0, 2).toUpperCase();
//   };

//   return (
//     // Tablet: p-2 (compact), Desktop: p-6 (spacious)
//     <div className="w-full h-full bg-white rounded-xl shadow-lg border border-gray-100 p-2 lg:p-6 flex flex-col transition-all duration-300">
//       {/* Title: Hidden on Tablet, Visible on Desktop */}
//       <h3 className="hidden lg:block text-[#2D3748] text-xl font-bold mb-6 flex-shrink-0">
//         Quick Navigation
//       </h3>

//       {/* Title replacement for Tablet (Centered Icon or Text) */}
//       <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-1">
//         {navItems.map((item, index) => {
//           const isActive = activeNav === item.name;
//           return (
//             <div key={index} className="mb-1">
//               <button
//                 type="button"
//                 onClick={() => handleNavClick(item)}
//                 className={`w-full flex items-center lg:justify-between justify-center px-2 py-3 lg:px-4 lg:py-3.5 rounded-lg transition-all text-left group relative ${
//                   isActive
//                     ? "bg-[#0080FF] text-white shadow-md"
//                     : "bg-transparent text-[#4A5568] hover:bg-gray-50"
//                 }`}
//                 title={item.name} // Tooltip on hover for tablet users
//               >
//                 {/* Desktop View: Full Name */}
//                 <span className="hidden lg:block font-semibold text-[15px]">
//                   {item.name}
//                 </span>

//                 {/* Tablet View: Initials Only */}
//                 <span
//                   className={`block lg:hidden font-bold text-[14px] ${
//                     isActive
//                       ? "text-white"
//                       : "text-gray-500 group-hover:text-blue-500"
//                   }`}
//                 >
//                   {getInitials(item.name)}
//                 </span>

//                 {/* Arrow Icons (Desktop Only) */}
//                 <div className="hidden lg:block">
//                   {item.hasSub ? (
//                     isWillOpen ? (
//                       <FiChevronDown size={20} />
//                     ) : (
//                       <FiChevronRight size={20} />
//                     )
//                   ) : (
//                     <FiChevronRight
//                       size={20}
//                       className={isActive ? "text-white" : "text-gray-300"}
//                     />
//                   )}
//                 </div>
//               </button>

//               {/* Sub Items: Hidden on Tablet to keep it collapsed/clean */}
//               <div className="hidden lg:block">
//                 {item.hasSub && isWillOpen && (
//                   <div className="ml-8 mt-2 space-y-4 border-l-2 border-blue-50 pl-4 py-2">
//                     {item.subItems.map((sub, i) => (
//                       <div
//                         key={sub.targetId || i}
//                         onClick={() => handleSubItemClick(sub)}
//                         className={`text-[14px] font-medium cursor-pointer transition-colors ${
//                           activeSubItem === sub.targetId
//                             ? "text-[#0080FF] font-bold"
//                             : "text-[#4A5568] hover:text-[#0080FF]"
//                         }`}
//                       >
//                         {sub.label}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <hr className="border-gray-100 my-4 lg:my-6" />

//       {/* PDF Button */}
//       <button
//         onClick={async () => {
//           const loadingToast = toast.loading("Generating PDF...");
//           try {
//             const formData = {
//               clientDetails: {
//                 ...clientDetails,
//                 fullName: `${clientDetails?.firstName || ""} ${
//                   clientDetails?.lastName || ""
//                 }`.trim(),
//                 phone: clientDetails?.mobile || clientDetails?.telephone || "",
//               },
//               willInstructions: willInstructions || {},
//               familyProtection: familyProtection || {},
//               lpaInstructions: lpaInstructions || {},
//               idInformation: idInformation || {},
//               signatures: signatures || {},
//             };
//             await generatePDF(formData);
//             toast.success("PDF generated successfully!", { id: loadingToast });
//           } catch (error) {
//             console.error("PDF Error:", error);
//             toast.error("Failed to generate PDF", { id: loadingToast });
//           }
//         }}
//         className="w-full bg-white border-2 border-gray-400 text-[#4A5568] font-bold py-3 lg:py-3.5 rounded-lg flex items-center justify-center gap-0 lg:gap-3 hover:bg-gray-50 transition-colors"
//         title="Export Draft as PDF"
//       >
//         <FiFileText size={20} />
//         {/* Text Hidden on Tablet */}
//         <span className="hidden lg:block text-sm lg:text-base">
//           Export Draft as PDF
//         </span>
//       </button>
//     </div>
//   );
// };

// export default QuickNavigation;

import { toast } from "react-hot-toast";
import { generatePDF } from "../services/pdfService.jsx";
import { useAppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { FiChevronRight, FiChevronDown, FiFileText } from "react-icons/fi";

const QuickNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    clientDetails,
    willInstructions,
    familyProtection,
    lpaInstructions,
    idInformation,
    signatures,
  } = useAppContext();

  const [isWillOpen, setIsWillOpen] = useState(false);
  const lastProcessedPath = useRef("");

  const navItems = useMemo(
    () => [
      { name: "Client Details", path: "/client-details" },
      {
        name: "Will Instructions",
        path: "/will-instructions",
        hasSub: true,
        subItems: [
          { label: "Children", targetId: "children" },
          { label: "Financial Information", targetId: "financial-information" },
          { label: "Funeral Wishes", targetId: "funeral-wishes" },
          { label: "Executors", targetId: "executors" },
          { label: "Legacies/Bequests", targetId: "legacies-bequests" },
          { label: "Property Trusts/ROO", targetId: "property-trusts-roo" },
          { label: "Residue", targetId: "residue" },
          { label: "Business Trust", targetId: "business-trust" },
          { label: "Testamentary Capacity", targetId: "testamentary-capacity" },
          {
            label: "Additional Instructions",
            targetId: "additional-instructions",
          },
        ],
      },
      { name: "LPA Instructions", path: "/lpa-instructions" },
      {
        name: "Family Protection Trust Instructions",
        path: "/family-protection",
      },
      { name: "ID & Supporting Information", path: "/id-information" },
      { name: "Review & Sign", path: "/review" },
    ],
    [],
  );

  useEffect(() => {
    setIsWillOpen(location.pathname === "/will-instructions");
  }, [location.pathname]);

  const activeNav =
    navItems.find((item) => location.pathname === item.path)?.name ||
    "Client Details";

  const activeSubItem = location.hash.replace("#", "");

  const handleNavClick = (item) => {
    if (location.pathname === item.path && item.name === "Will Instructions") {
      setIsWillOpen(!isWillOpen);
      return;
    }
    if (item.path && location.pathname !== item.path) {
      navigate(item.path, { replace: false });
    }
  };

  const handleSubItemClick = (sub) => {
    if (!location.pathname.includes("/will-instructions")) {
      navigate(`/will-instructions#${sub.targetId}`, { replace: false });
      setTimeout(() => {
        document.getElementById(sub.targetId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      window.history.replaceState(null, "", `#${sub.targetId}`);
      document.getElementById(sub.targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const getInitials = (name) => {
    const words = name.split(" ");
    return words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="hidden md:flex w-full h-full bg-white rounded-xl shadow-lg border border-gray-100 p-2 sm:p-3 lg:p-6 flex-col">
      {/* Title (Desktop Only) */}
      <h3 className="hidden lg:block text-[#2D3748] text-xl font-bold mb-6">
        Quick Navigation
      </h3>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-1">
        {navItems.map((item, index) => {
          const isActive = activeNav === item.name;

          return (
            <div key={index}>
              <button
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center justify-center lg:justify-between px-2 py-2.5 sm:py-3 lg:px-4 lg:py-3.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-[#0080FF] text-white shadow-md"
                    : "text-[#4A5568] hover:bg-gray-50"
                }`}
                title={item.name}
              >
                {/* Desktop */}
                <span className="hidden lg:block font-semibold text-[15px]">
                  {item.name}
                </span>

                {/* Mobile / Tablet */}
                <span
                  className={`block lg:hidden font-bold text-[13px] ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {getInitials(item.name)}
                </span>

                {/* Desktop Arrow */}
                <span className="hidden lg:block">
                  {item.hasSub ? (
                    isWillOpen ? (
                      <FiChevronDown />
                    ) : (
                      <FiChevronRight />
                    )
                  ) : (
                    <FiChevronRight className="text-gray-300" />
                  )}
                </span>
              </button>

              {/* Sub items (Desktop only) */}
              {item.hasSub && isWillOpen && (
                <div className="hidden lg:block ml-8 mt-2 space-y-4 border-l-2 border-blue-50 pl-4 py-2">
                  {item.subItems.map((sub) => (
                    <div
                      key={sub.targetId}
                      onClick={() => handleSubItemClick(sub)}
                      className={`text-[14px] cursor-pointer ${
                        activeSubItem === sub.targetId
                          ? "text-[#0080FF] font-bold"
                          : "text-[#4A5568] hover:text-[#0080FF]"
                      }`}
                    >
                      {sub.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <hr className="border-gray-100 my-3 sm:my-4 lg:my-6" />

      {/* PDF Button */}
      <button
        onClick={async () => {
          const loadingToast = toast.loading("Generating PDF...");
          try {
            await generatePDF({
              clientDetails,
              willInstructions,
              familyProtection,
              lpaInstructions,
              idInformation,
              signatures,
            });
            toast.success("PDF generated successfully!", { id: loadingToast });
          } catch {
            toast.error("Failed to generate PDF", { id: loadingToast });
          }
        }}
        className="w-full border-2 border-gray-400 text-[#4A5568] font-bold py-2.5 sm:py-3 lg:py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50"
        title="Export Draft as PDF"
      >
        <FiFileText size={18} />
        <span className="hidden lg:block">Export Draft as PDF</span>
      </button>
    </div>
  );
};

export default QuickNavigation;
