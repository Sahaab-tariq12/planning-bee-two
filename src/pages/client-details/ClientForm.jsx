import React from "react";
import Input from "../../components/Input";
import Dropdown from "../../components/Dropdown";
import { LuCalendar, LuUser } from "react-icons/lu";
import { validateField } from "../../utils/validation";
import { TITLE_OPTIONS, MARITAL_STATUS_OPTIONS } from "../../constants/options";

const ClientForm = ({
  title,
  setTitle,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  dob,
  setDob,
  telephone,
  setTelephone,
  mobile,
  setMobile,
  email,
  setEmail,
  maritalStatus,
  setMaritalStatus,
  address,
  setAddress,
  titleOptions,
  maritalStatusOptions,
  clientNumber = 1,
  errors = {},
  onBlur = () => {},
}) => {
  // Validation rules for the form
  const validationRules = {
    title: { required: true },
    firstName: { required: true, minLength: 2 },
    lastName: { required: true, minLength: 2 },
    dob: { required: true },
    email: { email: true },
    telephone: {
      validate: (value) => {
        if (!value) return true;
        const digitCount = (value.match(/\d/g) || []).length;
        return (
          digitCount >= 10 || "Phone number must contain at least 10 digits"
        );
      },
      pattern: "^[0-9s+-()]*$",
      patternMessage: "Only numbers, +, -, (, ) and spaces are allowed",
    },
    mobile: {
      validate: (value) => {
        if (!value) return true;
        const digitCount = (value.match(/\d/g) || []).length;
        return (
          digitCount >= 10 || "Mobile number must contain at least 10 digits"
        );
      },
      pattern: "^[0-9s+-()]*$",
      patternMessage: "Only numbers, +, -, (, ) and spaces are allowed",
    },
    maritalStatus: { required: true },
    address: { required: true, minLength: 5, maxLength: 200 },
  };

  // Handle field changes with validation
  const handleChange = (field, setter) => (e) => {
    let value = e.target ? e.target.value : e;

    setter(value);
    if (validationRules[field]) {
      const error = validateField(field, value, validationRules[field]);
      onBlur(field, value, error);
    }
  };
  const handleBlur = (field, value) => {
    if (validationRules[field]) {
      const error = validateField(field, value, validationRules[field]);
      onBlur(field, value, error);
    }
  };
  const getFieldError = (field) => {
    return errors[field] || "";
  };

  return (
    <div className="bg-[#F3F4F6] rounded-lg border border-gray-200 p-3 md:p-6 flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <div className="bg-blue-100 p-2 rounded-full">
          <LuUser size={20} className="text-[#0080FF] w-5 h-5 md:w-6 md:h-6" />
        </div>
        <h4 className="text-[#2D3748] text-lg font-semibold">
          Client {clientNumber}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4">
        <div className="mt-[4px]">
          <Dropdown
            label="Title"
            options={TITLE_OPTIONS}
            value={title}
            onChange={handleChange("title", setTitle)}
            onBlur={() => handleBlur("title", title)}
            error={getFieldError("title")}
            required
            placeholder="Select title"
          />
        </div>
        <Input
          label="First Names *"
          name="firstName"
          type="text"
          value={firstName}
          onChange={handleChange("firstName", setFirstName)}
          onBlur={() => handleBlur("firstName", firstName)}
          error={getFieldError("firstName")}
          placeholder="Enter first names"
        />

        <Input
          label="Surname *"
          name="lastName"
          type="text"
          value={lastName}
          onChange={handleChange("lastName", setLastName)}
          onBlur={() => handleBlur("lastName", lastName)}
          error={getFieldError("lastName")}
          placeholder="Enter surname"
        />

        <Input
          label="Date of Birth *"
          name="dob"
          type="date"
          placeholder="Select date"
          value={dob}
          onChange={handleChange("dob", setDob)}
          onBlur={() => handleBlur("dob", dob)}
          error={getFieldError("dob")}
        />
        <div className="mt-1">
          <Input
            label="Telephone"
            name="telephone"
            type="tel"
            placeholder="Enter telephone number"
            value={telephone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9+\-()\s]/g, "");
              if (value.length <= 20) {
                setTelephone(value);
                handleBlur("telephone", value);
              }
            }}
            onBlur={() => handleBlur("telephone", telephone)}
            error={getFieldError("telephone")}
          />
        </div>
        <div className="mt-1">
          <Input
            label="Mobile"
            name="mobile"
            type="tel"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9+\-()\s]/g, "");
              if (value.length <= 20) {
                setMobile(value);
                if (value) {
                  handleBlur("mobile", value);
                }
              }
            }}
            onBlur={() => handleBlur("mobile", mobile)}
            error={getFieldError("mobile")}
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={handleChange("email", setEmail)}
          onBlur={() => handleBlur("email", email)}
          error={getFieldError("email")}
        />
        <div className="mt-[6px]">
          <Dropdown
            label="Marital Status *"
            name="maritalStatus"
            options={MARITAL_STATUS_OPTIONS}
            value={maritalStatus}
            onChange={(value) => {
              setMaritalStatus(value);
              handleBlur("maritalStatus", value);
            }}
            onBlur={() => handleBlur("maritalStatus", maritalStatus)}
            error={getFieldError("maritalStatus")}
            placeholder="Select marital status"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <div className="flex flex-col">
            <Input
              label={
                clientNumber === 2
                  ? "Address (leave blank if same as Client 1)"
                  : "Address *"
              }
              name="address"
              type="textarea"
              placeholder={
                clientNumber === 2
                  ? "Enter complete address or leave blank if same as Client 1"
                  : "Enter complete address including postcode"
              }
              value={address}
              onChange={handleChange("address", setAddress)}
              onBlur={() => handleBlur("address", address)}
              error={getFieldError("address")}
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-end items-center mt-1">
              <span className="text-xs text-gray-500">
                {address.length}/200 characters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientForm;
