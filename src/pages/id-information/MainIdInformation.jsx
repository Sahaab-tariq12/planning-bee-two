import React, { useRef, useCallback } from "react";
import { FiCamera } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const MainIdInformation = () => {
  const navigate = useNavigate();
  const { idInformation, updateState } = useAppContext();
  const { idDocuments = [], supportingDocuments = [] } = idInformation;

  const [cameraTarget, setCameraTarget] = React.useState(null);
  const [cameraStream, setCameraStream] = React.useState(null);
  const [capturedFileName, setCapturedFileName] = React.useState('');
  const [advisorCertified, setAdvisorCertified] = React.useState(false);
  const videoRef = useRef(null);

  // Use ref to track previous idInformation to prevent infinite loops
  const prevIdInformationRef = useRef(JSON.stringify(idInformation));
  const isInternalUpdate = useRef(false);

  // --- NEW FIX: Camera Stream Connection Logic ---
  // Yeh useEffect tab chalega jab Modal open ho jayega aur videoRef available hoga
  React.useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.error("Error attempting to play video:", err);
      });
    }
  }, [cameraStream, cameraTarget]);
  // -----------------------------------------------

  const updateIdInformation = useCallback((updates) => {
    const currentIdInfoStr = JSON.stringify({ ...idInformation, ...updates });

    // Only update if data actually changed
    if (currentIdInfoStr !== prevIdInformationRef.current && !isInternalUpdate.current) {
      isInternalUpdate.current = true;
      updateState('idInformation', {
        ...idInformation,
        ...updates
      });
      prevIdInformationRef.current = currentIdInfoStr;

      // Reset flag after update
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
  }, [idInformation, updateState]);

  const handleIdFilesChange = useCallback(async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = await Promise.all(Array.from(event.target.files).map(async (file) => {
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: await readFileAsDataURL(file)
        };
      }));

      updateIdInformation({
        idDocuments: [...idDocuments, ...newFiles]
      });
    }
  }, [idDocuments, updateIdInformation]);

  const handleSupportingFilesChange = useCallback(async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = await Promise.all(Array.from(event.target.files).map(async (file) => {
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: await readFileAsDataURL(file)
        };
      }));

      updateIdInformation({
        supportingDocuments: [...supportingDocuments, ...newFiles]
      });
    }
  }, [supportingDocuments, updateIdInformation]);

  // File handling helpers
  const downloadFile = (fileData) => {
    const link = document.createElement('a');
    link.href = fileData.data;
    link.download = fileData.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File removal handlers
  const removeIdFile = useCallback((index, e) => {
    e.stopPropagation();
    const updatedFiles = [...idDocuments];
    updatedFiles.splice(index, 1);
    updateIdInformation({ idDocuments: updatedFiles });
  }, [idDocuments, updateIdInformation]);

  const removeSupportingFile = useCallback((index, e) => {
    e.stopPropagation();
    const updatedFiles = [...supportingDocuments];
    updatedFiles.splice(index, 1);
    updateIdInformation({ supportingDocuments: updatedFiles });
  }, [supportingDocuments, updateIdInformation]);

  const openCamera = async (target) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera capture is not supported in this browser.");
      return;
    }

    // Clear any previous filename when opening camera
    setCapturedFileName('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Updated: Yahan se videoRef logic hata di hai, kyun ke Modal abhi khula nahi hai.
      // Yeh logic ab upar wale useEffect main shift ho gayi hai.

      setCameraStream(stream);
      setCameraTarget(target);
    } catch (error) {
      console.error("Error accessing camera", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraTarget(null);
  };

  const readFileAsDataURL = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        resolve(null);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Generate filename with timestamp and custom name
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const formattedHours = String(hours).padStart(2, '0');
      const timestamp = `${day}-${month}-${year}_${formattedHours}-${minutes}-${ampm}`;
      const finalFileName = capturedFileName.trim() 
        ? `${capturedFileName.trim()}_${timestamp}.png`
        : `capture_${timestamp}.png`;

      const file = new File([blob], finalFileName, {
        type: "image/png",
      });

      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: await readFileAsDataURL(file),
        advisorCertified: advisorCertified,
        certificationDate: advisorCertified ? new Date().toISOString() : null
      };

      if (cameraTarget === "id") {
        updateIdInformation({
          idDocuments: [...idDocuments, fileData]
        });
      } else if (cameraTarget === "supporting") {
        updateIdInformation({
          supportingDocuments: [...supportingDocuments, fileData]
        });
      }

      // Reset camera modal state
      closeCamera();
      setCapturedFileName('');
      setAdvisorCertified(false);
    }, "image/png");
  }, [cameraTarget, closeCamera, idDocuments, supportingDocuments, updateIdInformation, capturedFileName, advisorCertified]);

  const totalIdDocs = idDocuments.length;
  const totalSupportingDocs = supportingDocuments.length;

  return (
    <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-3 md:p-6 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[22px] md:text-[26px] font-semibold text-[#1a202c]">
          ID and Supporting Information
        </h1>
        <p className="text-gray-500 text-[12px] md:text-base max-w-2xl">
          Upload client identification documents and any supporting materials
          required to verify identity and complete this application.
        </p>
      </div>

      {/* Client Identification Documents */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#2D3748]">
          CLIENT IDENTIFICATION DOCUMENTS
        </h2>
        <div className="bg-[#F7FBFF] border border-[#C4DDFC] rounded-xl p-3 md:p-6 flex flex-col gap-4">
          <p className="text-[#2D3748] text-sm md:text-base">
            Please upload photo identification for all clients (passport,
            driving licence, etc.)
          </p>

          <div className=" flex flex-col items-stretch md:flex-row gap-4 md:items-center">
            {/* File upload control */}
            <div className="flex-1">
              <label className="flex flex-row items-center justify-between md:gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-[#0080FF] transition-colors h-full">
                <span className="font-medium text-xs md:text-sm text-[#1a202c]">
                  Choose Files
                </span>
                <span className="text-xs md:text-sm text-gray-500 truncate">
                  {totalIdDocs === 0
                    ? "No file chosen"
                    : `${totalIdDocs} file${totalIdDocs > 1 ? "s" : ""
                    } selected`}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={handleIdFilesChange}
                  key={`id-files-${idDocuments.length}`}
                />
              </label>
            </div>

            {/* Take Photo button - live capture */}
            <button
              type="button"
              onClick={() => openCamera("id")}
              className="inline-flex justify-center items-center gap-2 bg-[#16A34A] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors h-[46px]"
            >
              <FiCamera size={18} />
              <span>Take Photo</span>
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Upload files: PDF, JPG, PNG (Max 10MB per file)
          </p>

          {/* Selected ID files list */}
          {totalIdDocs > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-600 max-h-24 overflow-y-auto">
              {idDocuments.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex justify-between items-center group hover:bg-gray-50 px-2 py-1 rounded"
                >
                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    className="truncate flex-1 text-left hover:text-blue-600"
                    title="Click to download"
                  >
                    {file.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeIdFile(index, e)}
                    className="text-red-500 hover:text-red-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Supporting Documents */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#2D3748]">
          SUPPORTING DOCUMENTS
        </h2>

        <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-3 md:p-6 flex flex-col gap-4">
          <p className="text-[#2D3748] text-sm md:text-base">
            Upload any additional supporting documents (bank statements,
            property deeds, etc.)
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* File upload control */}
            <div className="flex-1">
              <label className="flex items-center justify-between gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-[#0080FF] transition-colors h-full">
                <span className="font-medium text-sm text-[#1a202c]">
                  Choose Files
                </span>
                <span className="text-sm text-gray-500 truncate">
                  {totalSupportingDocs === 0
                    ? "No file chosen"
                    : `${totalSupportingDocs} file${totalSupportingDocs > 1 ? "s" : ""
                    } selected`}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={handleSupportingFilesChange}
                  key={`supporting-files-${supportingDocuments.length}`}
                />
              </label>
            </div>

            {/* Take Photo button - live capture */}
            <button
              type="button"
              onClick={() => openCamera("supporting")}
              className="inline-flex justify-center items-center gap-2 bg-[#16A34A] text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors h-[46px]"
            >
              <FiCamera size={18} />
              <span>Take Photo</span>
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Upload files: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
          </p>

          {/* Selected supporting files list */}
          {totalSupportingDocs > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-600 max-h-24 overflow-y-auto">
              {supportingDocuments.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex justify-between items-center group hover:bg-gray-50 px-2 py-1 rounded"
                >
                  <button
                    type="button"
                    onClick={() => downloadFile(file)}
                    className="truncate flex-1 text-left hover:text-blue-600"
                    title="Click to download"
                  >
                    {file.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => removeSupportingFile(index, e)}
                    className="text-red-500 hover:text-red-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Document Summary & Actions */}
      <section className="mt-2 flex flex-col gap-6">
        <h2 className="text-lg md:text-xl font-semibold text-[#2D3748]">
          DOCUMENT SUMMARY
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ID Documents Summary */}
          <div className="bg-[#F7FBFF] border border-[#C4DDFC] rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[#1a202c]">
                ID Documents
              </p>
              <p className="text-xs text-gray-500">
                {totalIdDocs} uploaded, 0 of {totalIdDocs || 0} certified
              </p>
            </div>
            <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#1A365D] text-white text-sm font-semibold">
              {totalIdDocs}
            </div>
          </div>

          {/* Supporting Documents Summary */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-[#1a202c]">
                Supporting Documents
              </p>
              <p className="text-xs text-gray-500">
                {totalSupportingDocs} uploaded, additional documentation
              </p>
            </div>
            <div className="flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#2D3748] text-white text-sm font-semibold">
              {totalSupportingDocs}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <button
            onClick={() => navigate("/family-protection")}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <div className="flex flex-col md:flex-row gap-3">
            {/* <button
              type="button"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
            >
              Save Progress
            </button> */}
            <button
              onClick={() => navigate("/review")}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0080FF] hover:bg-[#0070e6] text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Camera capture overlay */}
      {cameraTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 p-4 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#1a202c]">
              Capture{" "}
              {cameraTarget === "id" ? "ID Document" : "Supporting Document"}
            </h3>
            <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full max-h-[60vh] object-contain"
                autoPlay
                playsInline
              />
            </div>
            
            {/* File Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                File Name (optional)
              </label>
              <input
                type="text"
                value={capturedFileName}
                onChange={(e) => setCapturedFileName(e.target.value)}
                placeholder="Enter file name (without extension)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Leave empty for auto-generated name. Timestamp will be added automatically.
              </p>
            </div>

            {/* Advisor Certification */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={advisorCertified}
                  onChange={(e) => setAdvisorCertified(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    Advisor certifies true copy
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Date: {new Date().toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapture}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#16A34A] text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
              >
                <FiCamera size={16} />
                <span>Capture</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainIdInformation;