import React from "react";
import clsx from "clsx";

const Input = ({
  label,
  type = "text",
  name,
  placeholder = "",
  value,
  onChange,
  onBlur,
  className,
  error,
  required = false,
  rows,
  disabled = false,
  maxLength,
  ...rest
}) => {
  const inputClasses = clsx(
    "px-4 py-2 text-[14px] md:text-[16px] rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
    error ? "border-red-500 focus:ring-red-500" : "focus:border-blue-500",
    type === "textarea" && "resize-none",
    className,
  );

  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 leading-snug font-medium text-gray-700 text-[12px] md:text-[16px]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows || 3}
          className={inputClasses}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={inputClasses}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      )}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-red-500 text-sm mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
