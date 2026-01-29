import { X, RefreshCw, Check } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { useCallback, useRef, useEffect } from "react";

const SignatureModal = ({
  showSignatureModal,
  setShowSignatureModal,
  selectedClient,
  setSelectedClient,
  signature,
  setSignature,
  canvasRef,
  clearSignature,
}) => {
  const { updateState } = useAppContext();
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const frameId = useRef(null);
  const contextRef = useRef(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; // For high DPI displays
      canvas.height = rect.height * 2; // For high DPI displays
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2); // Scale for high DPI
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      contextRef.current = ctx;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [canvasRef]);

  // Draw line helper function
  const drawLine = useCallback((start, end) => {
    if (!contextRef.current) return;

    const ctx = contextRef.current;
    const { x: x1, y: y1 } = start;
    const { x: x2, y: y2 } = end;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }, []);

  // Start drawing
  const startDrawing = useCallback(
    (e) => {
      isDrawing.current = true;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x =
        (((e.clientX || e.touches[0].clientX) - rect.left) * scaleX) / 2;
      const y = (((e.clientY || e.touches[0].clientY) - rect.top) * scaleY) / 2;

      lastPoint.current = { x, y };
    },
    [canvasRef],
  );

  // Handle drawing
  const draw = useCallback(
    (e) => {
      if (!isDrawing.current || !lastPoint.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x =
        (((e.clientX || e.touches[0].clientX) - rect.left) * scaleX) / 2;
      const y = (((e.clientY || e.touches[0].clientY) - rect.top) * scaleY) / 2;

      // Use requestAnimationFrame for smoother drawing
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }

      frameId.current = requestAnimationFrame(() => {
        drawLine(lastPoint.current, { x, y });
        lastPoint.current = { x, y };
      });
    },
    [canvasRef, drawLine],
  );

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing.current) return;

    isDrawing.current = false;
    lastPoint.current = null;

    // Save the signature
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setSignature(dataUrl);
  }, [canvasRef, setSignature]);

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Add event listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);

    // Clean up
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseout", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [canvasRef, draw, startDrawing, stopDrawing]);

  // Handle clear signature
  const handleClearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  }, [canvasRef, setSignature]);

  const handleSaveSignature = useCallback(async () => {
    if (!signature) {
      console.log("No signature data to save");
      return;
    }

    const clientKey = selectedClient === "Client 1" ? "client1" : "client2";
    console.log(`Saving signature for ${clientKey}`, {
      signatureStartsWith: signature.substring(0, 30) + "...",
      signatureLength: signature.length,
    });

    try {
      await updateState(
        "signatures",
        { [clientKey]: signature },
        { mergeWithExisting: true },
      );
      console.log(`Signature saved successfully for ${clientKey}`);
      setShowSignatureModal(false);
    } catch (error) {
      console.error(`Error saving signature for ${clientKey}:`, error);
    }
  }, [signature, selectedClient, updateState, setShowSignatureModal]);
  if (!showSignatureModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">
              Select Client for Signature
            </h3>
            <button
              onClick={() => setShowSignatureModal(false)}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setSelectedClient("Client 1")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedClient === "Client 1"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Client 1
            </button>
            <button
              onClick={() => setSelectedClient("Client 2")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedClient === "Client 2"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Client 2
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900">
              {selectedClient} Signature
            </h4>
            <p className="text-gray-600 mt-1">
              Please have {selectedClient} sign below to confirm their
              instructions
            </p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 bg-white overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full touch-none bg-white"
              style={{
                cursor: "crosshair",
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                msUserSelect: "none",
              }}
            />
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400">
                  Sign here with your finger or mouse
                </p>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={handleClearSignature}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Clear Signature
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSignature}
                className={`px-6 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center ${
                  signature
                    ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!signature}
              >
                <Check className="h-5 w-5 mr-2" />
                Save Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignatureModal;
