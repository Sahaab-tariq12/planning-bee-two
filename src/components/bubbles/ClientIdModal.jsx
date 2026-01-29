import React from 'react';
import { X } from 'lucide-react';
import ErrorState from './ErrorState';

const ClientIdModal = ({
  showClientIdModal,
  setShowClientIdModal,
  cameraError,
  videoRef,
  isCaptured,
  image,
  devices,
  selectedDevice,
  handleSwitchCamera,
  captureImage,
  retryCapture,
  handleFileUpload,
  fileInputRef,
  stopCamera,
  handleSaveImage
}) => {
  if (!showClientIdModal) return null;

  return (
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
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="relative bg-black/5 p-2">
          {cameraError ? (
            <ErrorState 
              onRetry={() => window.location.reload()} 
              onUpload={() => fileInputRef.current?.click()} 
            />
          ) : (
            <div className="relative overflow-hidden rounded-xl bg-black">
              {!isCaptured ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto max-h-[70vh] mx-auto"
                />
              ) : (
                <div className="relative">
                  <img
                    src={image}
                    alt="Captured"
                    className="w-full h-auto max-h-[70vh] mx-auto"
                  />
                </div>
              )}

              {!isCaptured && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  {devices.length > 1 && (
                    <button
                      onClick={handleSwitchCamera}
                      className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                      aria-label="Switch camera"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={captureImage}
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                    aria-label="Take photo"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
                    aria-label="Upload photo"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
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
  );
};

export default ClientIdModal;
