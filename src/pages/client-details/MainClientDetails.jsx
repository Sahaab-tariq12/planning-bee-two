import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Input from "../../components/Input";
import ClientForm from "./ClientForm";
import MeetingAttendees from "./MeetingAttendees";
import { LuUserCheck, LuFileText } from "react-icons/lu";
import ServicesRequired from "./ServicesRequired";
import { validateField } from "../../utils/validation";

const MainClientDetails = () => {
  const navigate = useNavigate();
  const {
    clientDetails = {},
    updateState,
  } = useAppContext();
  const [showClient2, setShowClient2] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if Client 2 data exists and show the form automatically
  useEffect(() => {
    const hasClient2Data = 
      clientDetails?.firstName2 || 
      clientDetails?.lastName2 || 
      clientDetails?.email2 || 
      clientDetails?.telephone2 || 
      clientDetails?.mobile2;
    
    if (hasClient2Data) {
      setShowClient2(true);
    }
  }, [clientDetails]);

  useEffect(() => {
    console.log("Client Details updated:", clientDetails);
  }, [clientDetails]);
  console.log("Current Client Details:");

  // Initialize form data with default values
  const formData = {
    clientReference: clientDetails?.clientReference || "",
    adviserName: clientDetails?.adviserName || "",
    caseNotes: clientDetails?.caseNotes || "",
    previousWill: clientDetails?.previousWill || false,
    title: clientDetails?.title || "",
    firstName: clientDetails?.firstName || "",
    lastName: clientDetails?.lastName || "",
    dob: clientDetails?.dob || "",
    telephone: clientDetails?.telephone || "",
    mobile: clientDetails?.mobile || "",
    email: clientDetails?.email || "",
    maritalStatus: clientDetails?.maritalStatus || "",
    address: clientDetails?.address || "",
    title2: clientDetails?.title2 || "",
    firstName2: clientDetails?.firstName2 || "",
    lastName2: clientDetails?.lastName2 || "",
    dob2: clientDetails?.dob2 || "",
    telephone2: clientDetails?.telephone2 || "",
    mobile2: clientDetails?.mobile2 || "",
    email2: clientDetails?.email2 || "",
    maritalStatus2: clientDetails?.maritalStatus2 || "",
    address2: clientDetails?.address2 || "",
  };

  // Validation rules
  const validationRules = {
    caseNotes: { maxLength: 500 },
    address: { required: true, minLength: 5, maxLength: 200 },
    address2: { minLength: 5, maxLength: 200 },
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === "checkbox" ? checked : value;
    
    const updatedDetails = { ...clientDetails, [name]: fieldValue };

    console.log("=== INPUT CHANGE ===");
    console.log(`Field: ${name}, Value:`, fieldValue);

    // Validate field if there's a validation rule
    if (validationRules[name]) {
      const error = validateField(name, fieldValue, validationRules[name]);
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      // Clear error if no validation rule
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    updateState("clientDetails", updatedDetails);

    // Log the updated state after a small delay to see the updated value
    console.log(
      "Updated Client Details:",
      JSON.stringify(updatedDetails, null, 2)
    );
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (validationRules[name]) {
      const error = validateField(name, value, validationRules[name]);
      setErrors(prev => {
        if (error) {
          return { ...prev, [name]: error };
        } else {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
      });
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("=== FORM SUBMISSION ===");
    console.log(
      "Final Client Details:",
      JSON.stringify(clientDetails, null, 2)
    );

    // Validate form
    const newErrors = {};
    if (!formData.clientReference)
      newErrors.clientReference = "Client reference is required";
    if (!formData.adviserName)
      newErrors.adviserName = "Adviser name is required";
    // Add other validations

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Data is already in context, just navigate
    navigate("/will-instructions");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col gap-6"
    >
      {/* Client Information */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <LuUserCheck size={26} color="#0080FF" />
          <h3 className="text-[#2D3748] text-[20px] md:text-[22px] font-semibold">
            Client Information
          </h3>
        </div>
        <p className="text-gray-500 text-[14px] md:text-[16px]">
          Complete client details and application information matching your PDF
          forms
        </p>
      </div>

      {/* Application Information */}
      <div className="bg-[#F3F4F6] rounded-lg p-4 md:p-6 flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <LuFileText size={24} className="text-[#0080FF] w-5 h-5 md:w-6 md:h-6" />
          <h4 className="text-[#2D3748] text-[14px] md:text-lg font-semibold">
            Application Information
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Reference Number */}
          <Input
            label="Client Reference Number"
            name="clientReference"
            type="text"
            placeholder="Enter client reference number"
            value={formData.clientReference}
            onChange={handleInputChange}
            error={errors.clientReference}
          />

          {/* Adviser Name */}
          <Input
            label="Adviser Name"
            name="adviserName"
            type="text"
            value={formData.adviserName}
            onChange={handleInputChange}
            error={errors.adviserName}
          />
        </div>
        <div>
          {/* Case Notes */}
          <div className="flex flex-col">
            <Input
              label="Case Notes"
              name="caseNotes"
              type="textarea"
              value={formData.caseNotes}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.caseNotes}
              rows={3}
              maxLength={500}
            />
            <div className="flex justify-end items-center mt-1">
              <span className="text-xs text-gray-500">
                {formData.caseNotes.length}/500 characters
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client 1 Form */}
      <ClientForm
        title={formData.title}
        setTitle={(value) =>
          handleInputChange({ target: { name: "title", value } })
        }
        firstName={formData.firstName}
        setFirstName={(value) =>
          handleInputChange({ target: { name: "firstName", value } })
        }
        lastName={formData.lastName}
        setLastName={(value) =>
          handleInputChange({ target: { name: "lastName", value } })
        }
        dob={formData.dob}
        setDob={(value) =>
          handleInputChange({ target: { name: "dob", value } })
        }
        telephone={formData.telephone}
        setTelephone={(value) =>
          handleInputChange({ target: { name: "telephone", value } })
        }
        mobile={formData.mobile}
        setMobile={(value) =>
          handleInputChange({ target: { name: "mobile", value } })
        }
        email={formData.email}
        setEmail={(value) =>
          handleInputChange({ target: { name: "email", value } })
        }
        maritalStatus={formData.maritalStatus}
        setMaritalStatus={(value) =>
          handleInputChange({ target: { name: "maritalStatus", value } })
        }
        address={formData.address}
        setAddress={(value) =>
          handleInputChange({ target: { name: "address", value } })
        }
        clientNumber={1}
        errors={errors}
      />

      {/* Add Client 2 Toggle */}
      <div className="mt-2 mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox w-3 h-3 md:h-5 md:w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            checked={showClient2}
            onChange={(e) => setShowClient2(e.target.checked)}
          />
          <span className="ml-2 text-gray-700 text-[14px] md:text-[16px] font-medium">
            Add Client 2 (Spouse/Partner)
          </span>
        </label>
      </div>

      {/* Client 2 Form - Conditionally Rendered */}
      {showClient2 && (
        <ClientForm
          title={formData.title2}
          setTitle={(value) =>
            handleInputChange({ target: { name: "title2", value } })
          }
          firstName={formData.firstName2}
          setFirstName={(value) =>
            handleInputChange({ target: { name: "firstName2", value } })
          }
          lastName={formData.lastName2}
          setLastName={(value) =>
            handleInputChange({ target: { name: "lastName2", value } })
          }
          dob={formData.dob2}
          setDob={(value) =>
            handleInputChange({ target: { name: "dob2", value } })
          }
          telephone={formData.telephone2}
          setTelephone={(value) =>
            handleInputChange({ target: { name: "telephone2", value } })
          }
          mobile={formData.mobile2}
          setMobile={(value) =>
            handleInputChange({ target: { name: "mobile2", value } })
          }
          email={formData.email2}
          setEmail={(value) =>
            handleInputChange({ target: { name: "email2", value } })
          }
          maritalStatus={formData.maritalStatus2}
          setMaritalStatus={(value) =>
            handleInputChange({ target: { name: "maritalStatus2", value } })
          }
          address={formData.address2}
          setAddress={(value) =>
            handleInputChange({ target: { name: "address2", value } })
          }
          clientNumber={2}
          errors={errors}
        />
      )}

      {/* Meeting Attendees Section */}
      <MeetingAttendees />

      {/* Previous Will Checkbox */}
      <div className="flex flex-col gap-1">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-3 w-3 md:h-4 md:w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            name="previousWill"
            checked={formData.previousWill}
            onChange={handleInputChange}
          />
          <span className="ml-2 text-[#2D3748] text-[14px] md:text-[16px] font-bold">Previous Will</span>
        </label>
        <p className="text-gray-500 text-xs md:text-sm ml-7">
          Check if client has a previous will
        </p>
      </div>
      <ServicesRequired />

      {/* Continue to Will Instructions Button */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Previous
        </button>
        <div className="space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

export default MainClientDetails;
