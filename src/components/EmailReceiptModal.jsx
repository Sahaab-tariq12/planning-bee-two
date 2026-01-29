import React, { useState, useRef } from 'react';
import { X, Mail, Download, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { generatePDF } from '../services/pdfService.jsx';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const EmailReceiptModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const pdfUrlRef = useRef(null);
  
  const {
    clientDetails,
    willInstructions,
    familyProtection,
    lpaInstructions,
    idInformation,
    signatures,
    reviewSignData,
  } = useAppContext();

  // Generate PDF when modal opens
  React.useEffect(() => {
    if (isOpen && !pdfBlob) {
      generatePdfForModal();
    }
  }, [isOpen]);

  const generatePdfForModal = async () => {
    try {
      setIsGenerating(true);
      console.log("=== GENERATING PDF FOR EMAIL MODAL ===");
      
      if (!clientDetails) {
        toast.error("Client details not loaded!");
        return;
      }

      // Create a deep copy of the data
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

      // Generate PDF and get blob using the same service as download
      const pdfBlobResult = await generatePDF(formData, true); // Pass true to get blob
      
      // Check if result is actually a Blob
      if (pdfBlobResult instanceof Blob) {
        setPdfBlob(pdfBlobResult);
        
        // Create URL for the blob
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
        }
        pdfUrlRef.current = URL.createObjectURL(pdfBlobResult);
        
        toast.success("PDF ready for email attachment!");
      } else {
        console.error("PDF generation did not return a Blob:", pdfBlobResult);
        toast.error("PDF generation failed - invalid format");
      }
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmailWithAttachment = async () => {
    if (!pdfBlob) {
      toast.error("PDF not ready yet. Please wait...");
      return;
    }

    try {
      setIsGenerating(true);
      
      // Validate pdfBlob is actually a Blob
      if (!(pdfBlob instanceof Blob)) {
        throw new Error("PDF is not in the correct format");
      }
      
      // Convert PDF blob to base64 using FileReader
      const pdfBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const result = reader.result;
            if (typeof result === 'string' && result.includes(',')) {
              const base64 = result.split(',')[1]; // Remove data:application/pdf;base64, prefix
              resolve(base64);
            } else {
              reject(new Error("Invalid FileReader result format"));
            }
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read PDF file"));
        reader.readAsDataURL(pdfBlob);
      });

      const payload = {
        to: email,
        subject: "The Planning Bee - Application Receipt",
        message: "Please find your application receipt attached for your records. This document confirms successful submission of your application.",
        attachments: [
          {
            filename: `ApplicationReceipt-${clientDetails?.clientReference || 'Receipt'}.pdf`,
            content: pdfBase64
          }
        ]
      };

      const response = await axios.post(
        "https://sendrevisionemail-hyj74n2w3a-uc.a.run.app",
        payload
      );

      console.log("Email response:", response.data);
      
      if (response.data.success) {
        toast.success(`Email sent successfully to ${email}!`);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(response.data.error || 'Failed to send email');
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(`Failed to send email: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    await sendEmailWithAttachment();
  };

  const handleDownloadPdf = () => {
    if (pdfUrlRef.current) {
      const link = document.createElement('a');
      link.href = pdfUrlRef.current;
      link.download = `planning-bee-receipt-${clientDetails?.clientReference || 'receipt'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF downloaded!");
    }
  };

  const handleClose = () => {
    // Clean up blob URL
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
    setPdfBlob(null);
    setEmail('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-3 h-3 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-[16px] md:text-lg font-semibold text-gray-900">Email Receipt</h3>
              <p className="text-sm md:text-sm text-gray-500">Send receipt to your email</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleEmailSubmit} className="p-3 md:p-6 space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
            />
          </div>

          {/* PDF Attachment Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">PDF Attachment</span>
              </div>
              {isGenerating ? (
                <div className="text-xs text-blue-600">Generating...</div>
              ) : pdfBlob ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">Not ready</span>
                </div>
              )}
            </div>
            
            {pdfBlob && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">
                  File: planning-bee-receipt-{clientDetails?.clientReference || 'receipt'}.pdf
                </div>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download PDF
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Your email client will open with the receipt details. 
              You'll need to manually attach the PDF from the download above.
            </p>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col md:flow-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!pdfBlob || isGenerating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailReceiptModal;
