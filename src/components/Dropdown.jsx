import React, { useState, useRef, useEffect } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import clsx from "clsx";

const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  className,
  error,
  required = false,
  id,
  ...props
}) => {
  const dropdownId = id || `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Find the selected option's label, excluding disabled options
  // Only show selected value if it's not empty and matches a non-disabled option
  const selectedOption = value && value !== "" 
    ? options.find((opt) => opt.value === value && !opt.disabled)
    : null;
  const displayValue = selectedOption ? selectedOption.label : "";

  return (
    <div className="flex flex-col w-full relative" ref={dropdownRef}>
      {label && (
        <label 
          htmlFor={dropdownId} 
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        id={dropdownId}
        className={clsx(
          "px-4 py-2 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center cursor-pointer",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        onClick={toggleDropdown}
        {...props}
      >
        <span className={!displayValue ? "text-gray-400" : "truncate overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"}>
          {displayValue || placeholder}
        </span>
        <IoChevronDownOutline
          className={clsx("text-gray-500 transition-transform", {
            "transform rotate-180": isOpen,
          })}
        />
      </div>
      {isOpen && (
        <div 
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 ${
                option.disabled
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : `hover:bg-blue-50 cursor-pointer ${
                      value === option.value ? "bg-blue-100 text-blue-700" : ""
                    }`
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!option.disabled) {
                  setIsOpen(false);
                  onChange(option.value);
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Dropdown;
