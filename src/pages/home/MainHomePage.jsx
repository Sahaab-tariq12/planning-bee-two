import React, { useState } from "react";
import Header from "../../layout/Header";
import { FiFileText, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const MainHomePage = () => {
  const navigate = useNavigate();

  return (
    <Header>
      <div className="flex flex-col p-6 bg-white">
        {/* Title */}
        <h1 className="text-[#1a202c] text-3xl font-bold mb-8">Applications</h1>

        {/* Empty State Container */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-16 px-4">
          {/* File Icon */}
          <div className="mb-4 text-gray-500">
            <FiFileText size={60} strokeWidth={1.5} />
          </div>

          {/* Text Content */}
          <h2 className="text-[#1a202c] text-xl md:text-2xl font-bold mb-2">
            No Applications Yet
          </h2>
          <p className="text-gray-500 text-[16px] md:text-lg mb-8 text-center">
            Get started by creating your first application
          </p>

          {/* Action Button */}
          <button
            onClick={() => navigate("/client-details")}
            className="flex items-center gap-2 text-[14px] md:text-[16px] bg-[#0080FF] text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            <FiPlus size={20} strokeWidth={3} />
            Create New Application
          </button>
        </div>
      </div>
    </Header>
  );
};

export default MainHomePage;
