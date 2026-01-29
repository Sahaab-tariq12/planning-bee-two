import React from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { useFloatingBubbles } from './useFloatingBubbles';
import { useAppContext } from '../../context/AppContext';

const FloatingBubbles = () => {
  const {
    // State
    showClientIdModal,
    setShowClientIdModal,
    cameraError,
    videoRef,
    isCaptured,
    image,
    devices,
    selectedDevice,
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
    lastX,
    setLastX,
    lastY,
    setLastY,
    isSaving,
    setIsSaving,
    modalRef,
    ctxRef,
    // Methods
    captureImage,
    retryCapture,
    handleFileUpload,
    handleSwitchCamera,
    handleSaveImage,
    stopCamera,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    handleSignatureSave,
    handleCloseModal,
  } = useFloatingBubbles();
  
  const { updateState } = useAppContext();

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      {/* Client ID Capture Bubble */}
      {/* <button
        onClick={() => setShowClientIdModal(true)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
        aria-label="Capture Client ID"
      >
        <Camera className="h-6 w-6" />
      </button> */}

      {/* Signature Bubble */}
      <button
        onClick={() => setShowSignatureModal(true)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
        aria-label="Get signature"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* Client ID Capture Modal */}
      {showClientIdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Capture Client ID</h3>
                  <p className="text-gray-600 mt-1">Take a clear photo of the client's identification document</p>
                </div>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowClientIdModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Camera Preview Area */}
            <div className="relative bg-black/5 p-2">
              {cameraError ? (
                <ErrorState 
                  onRetry={startCamera} 
                  onUpload={() => fileInputRef.current?.click()} 
                />
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    {isCaptured ? (
                      <div className="relative w-full h-64 flex items-center justify-center">
                        <img 
                          src={image} 
                          alt="Captured" 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                      />
                    )}
                  </div>

                  <div className="flex justify-center">
                    {isCaptured ? (
                      <div className="flex space-x-4">
                        <button
                          onClick={retryCapture}
                          className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 hover:bg-gray-300 transition-colors"
                        >
                          Retake
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={captureImage}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                        aria-label="Take photo"
                      >
                        <div className="w-4 h-4 bg-white rounded-full mx-auto"></div>
                      </button>
                    )}
                  </div>

                  {devices.length > 1 && !isCaptured && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleSwitchCamera}
                        className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-800 hover:bg-gray-200 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Switch Camera
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}
            </div>
            
            {/* Bottom Controls */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {isCaptured ? 'Review the captured image' : 'Position the ID within the frame'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    stopCamera();
                    setShowClientIdModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Cancel
                </button>
                {!isCaptured ? (
                  <button
                    onClick={captureImage}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Capture
                  </button>
                ) : (
                  <button
                    onClick={handleSaveImage}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save ID
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Select Client for Signature</h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => setSelectedClient('Client 1')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedClient === 'Client 1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Client 1
                </button>
                <button
                  onClick={() => setSelectedClient('Client 2')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedClient === 'Client 2'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Client 2
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{selectedClient} Signature</h4>
                <p className="text-gray-600 mt-1">
                  Please have {selectedClient} sign below to confirm their instructions
                </p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 bg-white overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full h-full touch-none"
                  style={{
                    cursor: 'crosshair',
                    backgroundColor: 'white',
                    touchAction: 'none',
                    display: 'block',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!signature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400">Sign here with your finger or mouse</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={clearSignature}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Clear Signature
                </button>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCloseModal()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSignatureSave}
                    className={`px-6 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center ${
                      signature && !isSaving
                        ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!signature || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Save Signature
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingBubbles;
