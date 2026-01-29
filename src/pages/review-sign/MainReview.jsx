import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import ReviewSection from "./ReviewSection";
import Input from "../../components/Input";
import EmailReceiptModal from "../../components/EmailReceiptModal";

const MainReview = () => {
  const context = useAppContext();

  if (!context) {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="text-red-500 w-12 h-12" />
        <h2 className="text-xl font-semibold text-gray-800">
          Error Loading Data
        </h2>
        <p className="text-gray-600 text-center">
          Unable to load application data. Please try refreshing the page or
          contact support if the issue persists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Create a state to store the data
  const [formData, setFormData] = useState({
    clientDetails: {},
    willInstructions: {},
    familyProtection: {},
    lpaInstructions: {},
    idInformation: {},
    signatures: {},
  });

  // State for review and sign form data
  const [reviewSignData, setReviewSignData] = useState(() => {
    const clientData = context?.clientDetails || {};
    const contextReviewSignData = context?.reviewSignData || {};
    
    return {
      // Consultation points
      makingWill: contextReviewSignData.makingWill || false,
      safeStorage: contextReviewSignData.safeStorage || false,
      keepingWillUpToDate: contextReviewSignData.keepingWillUpToDate || false,
      lpasRegFee: contextReviewSignData.lpasRegFee || false,
      clientResponsibleSigning: contextReviewSignData.clientResponsibleSigning || false,
      opgRegFee: contextReviewSignData.opgRegFee || false,
      propertyTrusts: contextReviewSignData.propertyTrusts || false,
      otherWillTrusts: contextReviewSignData.otherWillTrusts || false,
      familyProtectionTrusts: contextReviewSignData.familyProtectionTrusts || false,
      cancellationTerms: contextReviewSignData.cancellationTerms || false,
      other: contextReviewSignData.other || false,
      otherDetails: contextReviewSignData.otherDetails || "",

      // Products taken - Sync with Services Required from context or client data
      productsWills: contextReviewSignData.productsWills || clientData.servicesRequired?.selectedServices?.includes('wills') || false,
      productsLPAs: contextReviewSignData.productsLPAs || clientData.servicesRequired?.selectedServices?.includes('lpas') || false,
      productsDiscretionaryTrust: contextReviewSignData.productsDiscretionaryTrust || clientData.servicesRequired?.selectedServices?.includes('discTrust') || false,
      productsPropertyProtectionTrust: contextReviewSignData.productsPropertyProtectionTrust || clientData.servicesRequired?.selectedServices?.includes('ppt') || false,
      productsBPRT: contextReviewSignData.productsBPRT || clientData.servicesRequired?.selectedServices?.includes('bprt') || false,
      productsFamilyProtectionTrust: contextReviewSignData.productsFamilyProtectionTrust || clientData.servicesRequired?.selectedServices?.includes('fpt') || false,
      productsVulnerableDisabilityTrust: contextReviewSignData.productsVulnerableDisabilityTrust || clientData.servicesRequired?.selectedServices?.includes('vpt') || false,
      productsRightsOfOccupation: contextReviewSignData.productsRightsOfOccupation || clientData.servicesRequired?.selectedServices?.includes('flit') || false,
      productsOther: contextReviewSignData.productsOther || clientData.servicesRequired?.otherServices?.length > 0 || false,
      productsOtherDetails: contextReviewSignData.productsOtherDetails || clientData.servicesRequired?.otherServices?.join(', ') || "",
      
      // For other services management
      otherServiceInput: "",
      otherServicesList: contextReviewSignData.otherServicesList || clientData.servicesRequired?.otherServices || [],

      // Pricing
      paymentTerms: contextReviewSignData.paymentTerms || "",
      totalAmount: contextReviewSignData.totalAmount || "",
      amountPaid: contextReviewSignData.amountPaid || "",
      amountOwing: contextReviewSignData.amountOwing || "",

      // Family Protection Trust question
      takingFamilyProtectionTrust: contextReviewSignData.takingFamilyProtectionTrust || false,
    };
  });

  // Load data from context - context already syncs with localStorage
  useEffect(() => {
    try {
      // Always use context data as it's the source of truth and syncs with localStorage
      if (context) {
        setFormData({
          clientDetails: context.clientDetails || {},
          willInstructions: context.willInstructions || {},
          familyProtection: context.familyProtection || {},
          lpaInstructions: context.lpaInstructions || {},
          idInformation: context.idInformation || {},
          signatures: context.signatures || {},
        });
      }
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Failed to load application data");
    }
  }, [context]);

  const {
    clientDetails = {},
    willInstructions = {},
    familyProtection = {},
    lpaInstructions = {},
    idInformation = {},
    signatures = {},
  } = formData;

  // Debug logs
  console.log("Client Details:", clientDetails);
  console.log("Signatures:", signatures);

  // Check if we have any data
  const hasNoData =
    !clientDetails ||
    !willInstructions ||
    !familyProtection ||
    (Object.keys(clientDetails).length === 0 &&
      Object.keys(willInstructions).length === 0 &&
      Object.keys(familyProtection).length === 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Here you would typically send the data to your backend
      console.log("Submitting form data:", formData);
      console.log("Review sign data:", reviewSignData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Your application has been submitted successfully!");
      // You can navigate to a success page or reset the form here
      // navigate('/success');
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit the application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle checkbox changes for products taken
  const handleProductCheckboxChange = (field) => {
    const newValue = !reviewSignData[field];
    const updatedReviewSignData = {
      ...reviewSignData,
      [field]: newValue,
    };
    setReviewSignData(updatedReviewSignData);

    // Save to context
    if (context && context.updateState) {
      context.updateState('reviewSignData', updatedReviewSignData);
    }

    // Update client details services required when products change
    const allServices = [
      ...(updatedReviewSignData.productsWills ? ['wills'] : []),
      ...(updatedReviewSignData.productsLPAs ? ['lpas'] : []),
      ...(updatedReviewSignData.productsDiscretionaryTrust ? ['discTrust'] : []),
      ...(updatedReviewSignData.productsPropertyProtectionTrust ? ['ppt'] : []),
      ...(updatedReviewSignData.productsBPRT ? ['bprt'] : []),
      ...(updatedReviewSignData.productsFamilyProtectionTrust ? ['fpt'] : []),
      ...(updatedReviewSignData.productsVulnerableDisabilityTrust ? ['vpt'] : []),
      ...(updatedReviewSignData.productsRightsOfOccupation ? ['flit'] : []),
    ];

    const otherServices = updatedReviewSignData.productsOtherDetails ? 
      updatedReviewSignData.productsOtherDetails.split(',').map(s => s.trim()).filter(s => s) : [];

    // Update client details
    if (context && context.updateState) {
      context.updateState('clientDetails', {
        ...context.clientDetails,
        servicesRequired: {
          selectedServices: allServices,
          otherServices: otherServices
        }
      });
    }
  };

  // Handle text changes for other products
  const handleProductTextChange = (field, value) => {
    const updatedReviewSignData = {
      ...reviewSignData,
      [field]: value,
    };
    setReviewSignData(updatedReviewSignData);

    // Save to context
    if (context && context.updateState) {
      context.updateState('reviewSignData', updatedReviewSignData);
    }

    if (field === 'productsOtherDetails' && context && context.updateState) {
      const otherServices = value ? value.split(',').map(s => s.trim()).filter(s => s) : [];
      const currentServices = [
        ...(updatedReviewSignData.productsWills ? ['wills'] : []),
        ...(updatedReviewSignData.productsLPAs ? ['lpas'] : []),
        ...(updatedReviewSignData.productsDiscretionaryTrust ? ['discTrust'] : []),
        ...(updatedReviewSignData.productsPropertyProtectionTrust ? ['ppt'] : []),
        ...(updatedReviewSignData.productsBPRT ? ['bprt'] : []),
        ...(updatedReviewSignData.productsFamilyProtectionTrust ? ['fpt'] : []),
        ...(updatedReviewSignData.productsVulnerableDisabilityTrust ? ['vpt'] : []),
        ...(updatedReviewSignData.productsRightsOfOccupation ? ['flit'] : []),
      ];

      context.updateState('clientDetails', {
        ...context.clientDetails,
        servicesRequired: {
          selectedServices: currentServices,
          otherServices: otherServices
        }
      });
    }
  };

  // Handle other service input change
  const handleOtherServiceInputChange = (value) => {
    setReviewSignData(prev => ({
      ...prev,
      otherServiceInput: value
    }));
  };

  // Add other service
  const handleAddOtherService = () => {
    const service = reviewSignData.otherServiceInput.trim();
    if (service && !reviewSignData.otherServicesList.includes(service)) {
      const updatedServicesList = [...reviewSignData.otherServicesList, service];
      const updatedReviewSignData = {
        ...reviewSignData,
        otherServicesList: updatedServicesList,
        otherServiceInput: "",
        productsOtherDetails: updatedServicesList.join(', ')
      };
      setReviewSignData(updatedReviewSignData);

      // Save to context
      if (context && context.updateState) {
        context.updateState('reviewSignData', updatedReviewSignData);
      }

      // Update client details
      const currentServices = [
        ...(updatedReviewSignData.productsWills ? ['wills'] : []),
        ...(updatedReviewSignData.productsLPAs ? ['lpas'] : []),
        ...(updatedReviewSignData.productsDiscretionaryTrust ? ['discTrust'] : []),
        ...(updatedReviewSignData.productsPropertyProtectionTrust ? ['ppt'] : []),
        ...(updatedReviewSignData.productsBPRT ? ['bprt'] : []),
        ...(updatedReviewSignData.productsFamilyProtectionTrust ? ['fpt'] : []),
        ...(updatedReviewSignData.productsVulnerableDisabilityTrust ? ['vpt'] : []),
        ...(updatedReviewSignData.productsRightsOfOccupation ? ['flit'] : []),
      ];

      context.updateState('clientDetails', {
        ...context.clientDetails,
        servicesRequired: {
          selectedServices: currentServices,
          otherServices: updatedServicesList
        }
      });
    }
  };

  // Remove other service
  const handleRemoveOtherService = (serviceToRemove) => {
    const updatedServicesList = reviewSignData.otherServicesList.filter(service => service !== serviceToRemove);
    const updatedReviewSignData = {
      ...reviewSignData,
      otherServicesList: updatedServicesList,
      productsOtherDetails: updatedServicesList.join(', ')
    };
    setReviewSignData(updatedReviewSignData);

    // Save to context
    if (context && context.updateState) {
      context.updateState('reviewSignData', updatedReviewSignData);
    }

    // Update client details
    const currentServices = [
      ...(updatedReviewSignData.productsWills ? ['wills'] : []),
      ...(updatedReviewSignData.productsLPAs ? ['lpas'] : []),
      ...(updatedReviewSignData.productsDiscretionaryTrust ? ['discTrust'] : []),
      ...(updatedReviewSignData.productsPropertyProtectionTrust ? ['ppt'] : []),
      ...(updatedReviewSignData.productsBPRT ? ['bprt'] : []),
      ...(updatedReviewSignData.productsFamilyProtectionTrust ? ['fpt'] : []),
      ...(updatedReviewSignData.productsVulnerableDisabilityTrust ? ['vpt'] : []),
      ...(updatedReviewSignData.productsRightsOfOccupation ? ['flit'] : []),
    ];

    context.updateState('clientDetails', {
      ...context.clientDetails,
      servicesRequired: {
        selectedServices: currentServices,
        otherServices: updatedServicesList
      }
    });
  };

  // Handle key press for other service input
  const handleOtherServiceKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOtherService();
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    const updatedReviewSignData = {
      ...reviewSignData,
      [field]: !reviewSignData[field],
    };
    setReviewSignData(updatedReviewSignData);

    // Save to context for persistence
    if (context && context.updateState) {
      context.updateState('reviewSignData', updatedReviewSignData);
    }
  };

  // Handle text changes
  const handleTextChange = (field, value) => {
    const updatedReviewSignData = {
      ...reviewSignData,
      [field]: value,
    };
    setReviewSignData(updatedReviewSignData);

    // Save to context for persistence
    if (context && context.updateState) {
      context.updateState('reviewSignData', updatedReviewSignData);
    }
  };

  // Handle signature capture
  const handleSignatureCapture = () => {
    // Navigate to signature capture or open signature modal
    toast("Signature capture feature would be implemented here");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 md:p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-8">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">
          CLIENT CARE DOCUMENT & RECEIPT
        </h1>
        <p className="mt-0 md:mt-2 text-gray-600 text-[14px] md:text-[16px]">
          Review your application details and complete the signing process
        </p>
      </div>

      {/* Client Information Header */}
      <div className="border-2 border-gray-300 rounded-lg p-3 md:p-6 bg-gray-50 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row">
                <span className="font-medium w-32">Client Reference:</span>
                <span className="font-mono">
                  {clientDetails.clientReference   || "N/A"}
                </span>
              </div>
              <div className="flex flex-col md:flex-row">
                <span className="font-medium w-32">Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              {clientDetails.firstName && (
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium w-32">Client 1 Name:</span>
                  <span>
                    {clientDetails.firstName} {clientDetails.lastName || ""}
                  </span>
                </div>
              )}
              {clientDetails.firstName2 && (
                <div className="flex flex-col md:flex-row">
                  <span className="font-medium w-32">Client 2 Name:</span>
                  <span>
                    {clientDetails.firstName2} {clientDetails.lastName2 || ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {clientDetails.address && (
          <div className="mt-4">
            <div className="flex flex-col md:flex-row">
              <span className="font-medium w-32">Address:</span>
              <span>{clientDetails.address}</span>
            </div>
          </div>
        )}
      </div>

      {hasNoData ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No data to display
          </h3>
          <p className="mt-1 text-gray-500">
            Please complete the previous steps to see your information here.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/client-details")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Application
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* <ReviewSection formData={formData} /> */}

          {/* Points Covered During Consultation */}
          <div className="space-y-4">
            <h4 className="font-bold md:font-semibold text-gray-800 text-[12px] md:text-lg border-b-2 border-gray-300 pb-2">
              POINTS COVERED DURING CONSULTATION
            </h4>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { field: "makingWill", label: "Making a Will" },
                  { field: "safeStorage", label: "Safe Storage" },
                  {
                    field: "keepingWillUpToDate",
                    label: "Keeping Will up to date",
                  },
                  {
                    field: "lpasRegFee",
                    label: "Lasting Powers of Attorney inc reg fee",
                  },
                  {
                    field: "clientResponsibleSigning",
                    label: "Client responsible for signing original docs",
                  },
                  {
                    field: "opgRegFee",
                    label:
                      "Client agrees informed of £82 OPG reg fee",
                    required: true,
                  },
                  {
                    field: "propertyTrusts",
                    label: "Property Trusts/Rights to occupy",
                  },
                  { field: "otherWillTrusts", label: "Other Will trusts" },
                  {
                    field: "familyProtectionTrusts",
                    label: "Family Protection Trusts",
                  },
                  {
                    field: "cancellationTerms",
                    label: "Cancellation Terms",
                    required: true,
                  },
                  { field: "other", label: "Other" },
                ].map(({ field, label, required }) => (
                  <label key={field} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 rounded border-gray-300"
                      checked={reviewSignData[field]}
                      onChange={() => handleCheckboxChange(field)}
                      style={{
                        borderColor:
                          required && !reviewSignData[field]
                            ? "#ef4444"
                            : undefined,
                      }}
                    />
                    <span
                      className={`text-xs md:text-sm font-medium ${
                        required && !reviewSignData[field] ? "text-red-600" : ""
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {reviewSignData.other && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other details:
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md text-xs md:text-sm"
                    rows={3}
                    placeholder="Please specify other points covered..."
                    value={reviewSignData.otherDetails}
                    onChange={(e) =>
                      handleTextChange("otherDetails", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Products Taken */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-[16px] md:text-lg border-b-2 border-gray-300 pb-2">
              PRODUCTS TAKEN
            </h4>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 md:p-6">
              {/* <div className="mb-4">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <span className="text-xs md:text-sm font-medium">✏️ Editable - Changes sync to Client Details</span>
                </div>
              </div> */}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {[
                  { field: "productsWills", label: "Wills" },
                  {
                    field: "productsLPAs",
                    label: "Lasting Powers of Attorney",
                  },
                  {
                    field: "productsDiscretionaryTrust",
                    label: "Discretionary Trust",
                  },
                  {
                    field: "productsPropertyProtectionTrust",
                    label: "Property Protection Trust",
                  },
                  {
                    field: "productsBPRT",
                    label: "Business Property Relief Trust",
                  },
                  {
                    field: "productsFamilyProtectionTrust",
                    label: "Family Protection Trust",
                  },
                  {
                    field: "productsVulnerableDisabilityTrust",
                    label: "Vulnerable/Disability Trust",
                  },
                  {
                    field: "productsRightsOfOccupation",
                    label: "Rights of Occupation",
                  },
                  { field: "productsOther", label: "Other" },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center space-x-2 cursor-pointer hover:bg-white hover:bg-opacity-50 p-2 rounded transition-colors">
                    <input
                      type="checkbox"
                      className="w-3 h-3 md:w-4 md:h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={reviewSignData[field]}
                      onChange={() => handleProductCheckboxChange(field)}
                    />
                    <span className="text-xs md:text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>

              {reviewSignData.productsOther && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Services
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={reviewSignData.otherServiceInput || ""}
                        onChange={(e) => handleOtherServiceInputChange(e.target.value)}
                        onKeyPress={handleOtherServiceKeyPress}
                        placeholder="Enter other services"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button 
                        type="button"
                        onClick={handleAddOtherService}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0080FF] hover:bg-blue-700 text-white rounded-lg w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {reviewSignData.otherServicesList && reviewSignData.otherServicesList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reviewSignData.otherServicesList.map((service, index) => (
                        <div 
                          key={index}
                          className="bg-gray-100 text-gray-800 text-xs md:text-sm px-3 py-1 rounded-full flex items-center gap-2"
                        >
                          {service}
                          <button 
                            type="button"
                            onClick={() => handleRemoveOtherService(service)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Terms */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-[16px] md:text-lg border-b-2 border-gray-300 pb-2">
              PAYMENT TERMS
            </h4>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 md:p-6">
              <div className="mb-4">
                <Input
                  label="Payment Terms"
                  type="textarea"
                  rows={3}
                  placeholder="Enter payment terms..."
                  value={reviewSignData.paymentTerms}
                  onChange={(e) =>
                    handleTextChange("paymentTerms", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Total Amount"
                    type="number"
                    placeholder="0.00"
                    value={reviewSignData.totalAmount}
                    onChange={(e) =>
                      handleTextChange("totalAmount", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Input
                    label="Amount Paid"
                    type="number"
                    placeholder="0.00"
                    value={reviewSignData.amountPaid}
                    onChange={(e) =>
                      handleTextChange("amountPaid", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Input
                    label="Amount Owing"
                    type="number"
                    placeholder="0.00"
                    value={reviewSignData.amountOwing}
                    onChange={(e) =>
                      handleTextChange("amountOwing", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Client Agreement and Terms */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-[14px] md:text-lg border-b-2 border-gray-300 pb-2">
              CLIENT AGREEMENT AND TERMS FOR DRAFTING WILL / WILL TRUSTS / LPA'S
            </h4>

            <div className="space-y-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-xs md:text-sm font-medium mb-4">
                By signing below the client(s) agree to the following:
              </p>

              <div className="space-y-3">
                {[
                  "The information recorded in this form is my/our instruction(s) and I/we know of no reason why my/our document(s) should not be prepared in this way.",
                  "I understand that The Planning Bee Ltd may use this information in line with its normal marketing activities as governed by the GDPR.",
                  "I confirm and understand that The Planning Bee Ltd are not responsible for ensuring the original Wills and Lasting Powers of Attorney are signed by the client.",
                  "I agree for my draft documents to be sent by email.",
                  "I understand my draft documents will be sent to me within 21 days.",
                  "The Client agrees that they fully understood the products they are taking out and were under no pressure to do so.",
                  "The Client agrees that they can cancel at any time, if they cancel within 14 days they will receive a full refund. They can cancel by emailing support@theplanningbee.co.uk.",
                  "The Client agrees it is their responsibility to ensure that the spelling of all names, addresses and dates of births are correct on the draft documents.",
                  "The Client agrees to the Terms & Conditions and have been left with a copy of such.",
                ].map((point, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-xs md:text-sm font-bold mt-1">•</span>
                    <p className="text-xs md:text-sm">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Family Protection Trust */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-[16px] md:text-lg border-b-2 border-gray-300 pb-2">
              FAMILY PROTECTION TRUST
            </h4>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 md:p-6">
              <div className="space-y-3">
                <label className="text-xs md:text-base font-medium">
                  Are you taking a Family Protection Trust?
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="fpt-yes"
                      checked={
                        reviewSignData.takingFamilyProtectionTrust === true
                      }
                      onChange={() =>
                        handleTextChange("takingFamilyProtectionTrust", true)
                      }
                      className="w-3 h-3 md:w-4 md:h-4"
                    />
                    <label
                      htmlFor="fpt-yes"
                      className="text-xs md:text-sm font-medium cursor-pointer"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="fpt-no"
                      checked={
                        reviewSignData.takingFamilyProtectionTrust === false
                      }
                      onChange={() =>
                        handleTextChange("takingFamilyProtectionTrust", false)
                      }
                      className="w-3 h-3 md:w-4 md:h-4"
                    />
                    <label
                      htmlFor="fpt-no"
                      className="text-xs md:text-sm font-medium cursor-pointer"
                    >
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Show T&Cs only when Yes is selected */}
            {reviewSignData.takingFamilyProtectionTrust === true && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 md:p-6">
                <p className="font-medium text-gray-800 mb-4">
                  I/We confirm the following:
                </p>
                <div className="space-y-3 text-xs md:text-sm">
                  <p>
                    1. the notes of the instructions and advice detailed on the
                    preceding pages is accurate;
                  </p>
                  <p>
                    2. I/we understand that this instructions will be submitted
                    The Planning Bee Ltd who will need to instruct a firm who
                    are regulated to perform trust drafting and conveyancing in
                    order to prepare the trust deed and that they can instruct
                    any regulated law firm to do so
                  </p>
                  <p>
                    3. I/we have been provided with a client care document and
                    receipt and I am aware of my cancellation terms.
                  </p>
                  <p>
                    4. I/we consent to all my/our relevant personal details
                    contained within this form, including any Identification and
                    relevant information regarding my Will to be passed to the
                    trust drafting firm.
                  </p>
                  <p>
                    5. I/we consent to the trust drafting firm passing all
                    correspondence relating to this trust including the trust
                    deed to The Planning Bee Limited.
                  </p>
                  <p>
                    6. Throughout the process of your instructions being taken,
                    a number of available options will have been explained to
                    you in order for your legal documents to be drafted in
                    accordance with your wishes. These documents are specific to
                    your own individual requirements and so the decision of what
                    to include and what not to include, is yours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Signature Capture */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-[16px] md:text-lg border-b-2 border-gray-300 pb-2">
              SIGNATURES
            </h4>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-[14px] md:text-[16px] text-gray-800">Client Signatures</h5>
                <span className="text-sm text-gray-500">
                  {signatures.client1 || signatures.client2
                    ? "Captured"
                    : "Required"}
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-3">
                Digital signatures are required to complete the application
              </p>

              {/* Display captured signatures */}
              {(signatures.client1 || signatures.client2) && (
                <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
                  <h6 className="font-medium text-xs md:text-sm mb-3 text-gray-800">
                    Captured Signatures:
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {signatures.client1 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Client 1:</p>
                        <img
                          src={signatures.client1}
                          alt="Client 1 Signature"
                          className="border border-gray-300 rounded max-h-16 bg-white"
                        />
                      </div>
                    )}
                    {signatures.client2 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Client 2:</p>
                        <img
                          src={signatures.client2}
                          alt="Client 2 Signature"
                          className="border border-gray-300 rounded max-h-16 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* <button
                type="button"
                onClick={handleSignatureCapture}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {signatures.client1 || signatures.client2
                  ? "Update Signatures"
                  : "Capture Signatures"}
              </button> */}
            </div>
          </div>

          {/* Final Actions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-lg border-b-2 border-gray-300 pb-2">
              FINAL ACTIONS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Download Receipt
              </button> */}

              {/* <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Download Application
              </button> */}

              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Email Receipt
              </button>
              {/* <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Complete Application"}
              </button> */}
            </div>

            {!signatures.client1 && !signatures.client2 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Required before submission:</strong>
                </p>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Client signatures must be captured</li>
                </ul>
              </div>
            )}
          </div>

          {/* Back Navigation */}
          <div className="flex justify-start pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/id-information")}
              className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
          </div>
        </div>
      )}
      
      {/* Email Receipt Modal */}
      <EmailReceiptModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
      />
    </div>
  );
};

export default MainReview;
