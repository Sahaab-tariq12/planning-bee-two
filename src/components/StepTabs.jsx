// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const STEPS = [
//   { id: 1, title: "Client Details", path: "/client-details" },
//   { id: 2, title: "Will Instructions", path: "/will-instructions" },
//   { id: 3, title: "LPA Instructions", path: "/lpa-instructions" },
//   { id: 4, title: "Family Protection Trust", path: "/family-protection" },
//   { id: 5, title: "ID & Supporting Info", path: "/id-information" },
//   { id: 6, title: "Review & Sign", path: "/review" },
// ];

// const StepTabs = ({ steps = STEPS }) => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const currentStepIndex = steps.findIndex((step) =>
//     location.pathname.startsWith(step.path)
//   );

//   const handleStepClick = (index) => {
//     const target = steps[index];
//     // Prevent navigation loop and ensure valid navigation
//     if (target && target.path && location.pathname !== target.path) {
//       console.log("StepTabs: Navigating to ->", target.path);
//       navigate(target.path, { replace: false });
//     }
//   };

//   return (
//     <div className="w-full bg-white border-b border-gray-100">
//       {/* Added overflow-x-auto for responsiveness */}
//       <div className="px-4 md:px-6 py-4 flex items-center justify-between overflow-x-auto scrollbar-hide">
//         <div className="flex-1 flex items-center gap-3 min-w-max">
//           {steps.map((step, index) => {
//             const isActive = index === currentStepIndex;
//             const isCompleted = index < currentStepIndex;

//             return (
//               <div
//                 key={step.id || index}
//                 className="flex items-center flex-shrink-0"
//               >
//                 <button
//                   type="button"
//                   onClick={() => handleStepClick(index)}
//                   className="flex items-center gap-1 group outline-none"
//                 >
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center text-center border-2 text-[16px] font-semibold transition-all ${
//                       isActive
//                         ? "bg-[#0080FF] border-[#0080FF] text-white shadow-md"
//                         : isCompleted
//                         ? "bg-white border-[#0080FF] text-[#0080FF]"
//                         : "bg-gray-100 border-gray-300 text-gray-500"
//                     }`}
//                   >
//                     {index + 1}
//                   </div>

//                   <div className="flex flex-col text-left">
//                     <span
//                       className={`text-sm font-semibold tracking-tight whitespace-nowrap ${
//                         isActive ? "text-[#1a202c]" : "text-gray-500"
//                       }`}
//                     >
//                       {step.title}
//                     </span>
//                   </div>
//                 </button>

//                 {index !== steps.length - 1 && (
//                   <div
//                     className={`h-px w-8 md:w-14 ml-4 ${
//                       isCompleted ? "bg-[#0080FF]" : "bg-gray-200"
//                     }`}
//                   />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StepTabs;

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, title: "Client Details", path: "/client-details" },
  { id: 2, title: "Will Instructions", path: "/will-instructions" },
  { id: 3, title: "LPA Instructions", path: "/lpa-instructions" },
  { id: 4, title: "Family Protection Trust", path: "/family-protection" },
  { id: 5, title: "ID & Supporting Info", path: "/id-information" },
  { id: 6, title: "Review & Sign", path: "/review" },
];

const StepTabs = ({ steps = STEPS }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentStepIndex = steps.findIndex((step) =>
    location.pathname.startsWith(step.path),
  );

  const handleStepClick = (index) => {
    const target = steps[index];
    if (target && target.path && location.pathname !== target.path) {
      navigate(target.path, { replace: false });
    }
  };

  return (
    <div className="w-full bg-white border-b border-gray-100">
      {/* Mobile horizontal scroll only */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 min-w-max">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <div
                key={step.id || index}
                className="flex items-center flex-shrink-0"
              >
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  className="flex items-center gap-2 outline-none"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 text-[14px] sm:text-[16px] font-semibold transition-all ${
                      isActive
                        ? "bg-[#0080FF] border-[#0080FF] text-white shadow-md"
                        : isCompleted
                          ? "bg-white border-[#0080FF] text-[#0080FF]"
                          : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap ${
                      isActive ? "text-[#1a202c]" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                {index !== steps.length - 1 && (
                  <div
                    className={`h-px w-6 sm:w-8 md:w-14 ml-3 sm:ml-4 ${
                      isCompleted ? "bg-[#0080FF]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepTabs;
