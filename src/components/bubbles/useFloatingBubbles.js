import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";

export const useFloatingBubbles = () => {
  // State for client ID modal
  const [showClientIdModal, setShowClientIdModal] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [image, setImage] = useState(null);
  const [isCaptured, setIsCaptured] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // State for signature modal
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("Client 1");
  const [signature, setSignature] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const modalRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  
  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && showSignatureModal) {
        handleCloseModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSignatureModal]);
  
  const handleCloseModal = async () => {
    if (signature && !isSaving) {
      const shouldSave = window.confirm('Do you want to save the current signature before closing?');
      if (shouldSave) {
        setIsSaving(true);
        const success = await saveSignature();
        setIsSaving(false);
        if (!success) return; // Don't close if save failed
      }
    }
    setShowSignatureModal(false);
    setSelectedClient('Client 1');
  };

  // Get context
  const { signatures, updateState } = useAppContext();

  // Camera functions
  const getDevices = async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDevice) {
        const backCamera = videoDevices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear")
        );
        setSelectedDevice(
          backCamera ? backCamera.deviceId : videoDevices[0].deviceId
        );
      }
    } catch (err) {
      console.error("Error getting devices:", err);
    }
  };

  const startCamera = async () => {
    if (!showClientIdModal) return;

    try {
      setCameraError(false);
      setImage(null);
      setIsCaptured(false);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          facingMode: selectedDevice ? undefined : { ideal: "environment" },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL("image/jpeg", 0.9));
    setIsCaptured(true);
    stopCamera();
  };

  const retryCapture = () => {
    setImage(null);
    setIsCaptured(false);
    startCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setIsCaptured(true);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwitchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(
        (device) => device.deviceId === selectedDevice
      );
      const nextIndex = (currentIndex + 1) % devices.length;
      setSelectedDevice(devices[nextIndex].deviceId);
    }
  };

  const handleSaveImage = () => {
    console.log("Image saved:", image);
    setTimeout(() => {
      stopCamera();
      setShowClientIdModal(false);
    }, 500);
  };

  // Load signature when modal opens or client changes
  useEffect(() => {
    if (showSignatureModal && canvasRef.current && signatures) {
      const clientKey = selectedClient === "Client 1" ? "client1" : "client2";
      const savedSignature = signatures[clientKey];
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (savedSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setSignature(savedSignature);
        };
        img.onerror = () => {
          console.error("Failed to load signature image");
          setSignature(null);
        };
        img.src = savedSignature;
      } else {
        setSignature(null);
      }
    }
  }, [showSignatureModal, selectedClient, signatures]);

  // Handle client change
  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Load signature for the newly selected client
      if (signatures) {
        const clientKey = selectedClient === "Client 1" ? "client1" : "client2";
        const existingSignature = signatures[clientKey];

        if (existingSignature) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setSignature(existingSignature);
          };
          img.src = existingSignature;
        } else {
          setSignature(null);
        }
      } else {
        setSignature(null);
      }
    }
  }, [selectedClient, showSignatureModal]);

  // Signature functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    setIsDrawing(true);
    setLastX(x * scaleX);
    setLastY(y * scaleY);

    // Start a new path
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x * scaleX, y * scaleY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // Create a new signature when starting to draw
    // setSignature(canvas.toDataURL("image/png"));
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = ((e.clientX || e.touches[0].clientX) - rect.left) * scaleX;
    const y = ((e.clientY || e.touches[0].clientY) - rect.top) * scaleY;

    const ctx = canvas.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();

    setSignature(canvas.toDataURL("image/png"));
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      document.body.style.cursor = "";

      // Update the signature state one final time when stopping drawing
      if (canvasRef.current) {
        const signatureData = canvasRef.current.toDataURL("image/png");
        setSignature(signatureData);
      }
    }
  };

  const clearSignature = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignature(null);

      // Clear the signature in context when clearing the canvas
      const clientKey = selectedClient === "Client 1" ? "client1" : "client2";
      updateState(
        "signatures",
        { [clientKey]: null },
        { mergeWithExisting: true }
      );
    }
  };

  // Function to save the current signature
  const saveCurrentSignature = async () => {
    if (canvasRef.current && signature) {
      const clientKey = selectedClient === "Client 1" ? "client1" : "client2";
      await updateState(
        "signatures",
        { [clientKey]: signature },
        { mergeWithExisting: true }
      );
      return true;
    }
    return false;
  };

  const saveSignature = async () => {
    if (!canvasRef.current) return false;

    try {
      const signatureData = canvasRef.current.toDataURL("image/png");
      const clientKey = selectedClient === "Client 1" ? "client1" : "client2";

      // Wait for the update to complete
      await updateState(
        "signatures",
        { [clientKey]: signatureData },
        { mergeWithExisting: true }
      );

      // Update local state
      setSignature(signatureData);
      return true;
    } catch (error) {
      console.error("Error saving signature:", error);
      return false;
    }
  };
  
  const handleSignatureSave = async () => {
    if (!signature) return false;
    
    setIsSaving(true);
    try {
      const success = await saveSignature();
      if (success) {
        setShowSignatureModal(false);
        setSelectedClient('Client 1');
      }
      return success;
    } finally {
      setIsSaving(false);
    }
  };

  // Effects
  useEffect(() => {
    if (showClientIdModal) {
      getDevices();
    }
    return () => {
      stopCamera();
    };
  }, [showClientIdModal]);

  useEffect(() => {
    if (showClientIdModal && selectedDevice) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedDevice]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    // Client ID Modal
    showClientIdModal,
    setShowClientIdModal,
    cameraError,
    devices,
    selectedDevice,
    setSelectedDevice,
    image,
    isCaptured,
    videoRef,
    fileInputRef,

    // Signature Modal
    showSignatureModal,
    setShowSignatureModal,
    selectedClient,
    setSelectedClient,
    signature,
    setSignature,
    canvasRef,
    isDrawing,
    isSaving,
    modalRef,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    handleSignatureSave,
    handleCloseModal,
    saveSignature,

    // Camera functions
    getDevices,
    startCamera,
    stopCamera,
    captureImage,
    retryCapture,
    handleFileUpload,
    handleSwitchCamera,
    handleSaveImage,
  };
};
