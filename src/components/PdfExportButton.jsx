import React from "react";
import { Download } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { generatePDF } from "../services/pdfService.jsx";
import { toast } from "react-hot-toast";

const PdfExportButton = ({ className = "" }) => {
  const {
    clientDetails,
    willInstructions,
    familyProtection,
    lpaInstructions,
    idInformation,
    signatures,
    reviewSignData,
  } = useAppContext();

  const handleExport = async () => {
    try {
      console.log("=== PDF EXPORT BUTTON CLICKED ===");
      console.log("Client Details:", clientDetails);
      console.log("Will Instructions:", willInstructions);
      console.log("Review Sign Data:", reviewSignData);
      console.log("Review Sign Data type:", typeof reviewSignData);
      console.log("Review Sign Data keys:", reviewSignData ? Object.keys(reviewSignData) : 'null/undefined');
      console.log("Payment Terms in reviewSignData:", reviewSignData?.paymentTerms);
      console.log("Total Amount in reviewSignData:", reviewSignData?.totalAmount);      
      if (!clientDetails) {
        toast.error("Client details not loaded!");
        return;
      }

      // Create a deep copy of the data to avoid reference issues
      const formData = JSON.parse(JSON.stringify({
        clientDetails: {
          ...clientDetails,
          fullName: `${clientDetails.firstName || ''} ${clientDetails.lastName || ''}`.trim(),
          phone: clientDetails.mobile || clientDetails.telephone || '',
          address: `${clientDetails.address || ''} ${clientDetails.address2 ? clientDetails.address2 : ''}`.trim(),
          nationalInsurance: clientDetails.clientReference || '',
          maritalStatus: clientDetails.maritalStatus || '',
          email: clientDetails.email || '',
          dob: clientDetails.dob || ''
        },
        willInstructions: willInstructions || {},
        familyProtection: familyProtection || {},
        lpaInstructions: lpaInstructions || {},
        idInformation: idInformation || {},
        signatures: signatures || {},
        reviewSignData: reviewSignData || {}
      }));

      console.log("=== SENDING TO GENERATE PDF ===");
      console.log("Form Data:", JSON.stringify(formData, null, 2));
      
      await generatePDF(formData);
      toast.success("PDF generated successfully!");
    } catch (e) {
      console.error("PDF generation error:", e);
      toast.error(`Failed to generate PDF: ${e.message}`);
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm ${className}`}
      style={{ minHeight: '48px' }} // iOS touch target minimum
    >
      <Download className="h-4 w-4" />
      <span>Export to PDF</span>
    </button>
  );
};

export default PdfExportButton;
