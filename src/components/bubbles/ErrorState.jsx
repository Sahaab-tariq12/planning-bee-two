import React from 'react';

const ErrorState = ({ onRetry, onUpload }) => (
  <div className="bg-red-50 p-8 rounded-xl text-center">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
      <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-red-800 mb-2">Camera Access Required</h3>
    <p className="text-red-700 mb-6">Please allow camera access to capture ID photos</p>
    <div className="space-x-4">
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Try Again
      </button>
      <button
        onClick={onUpload}
        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Upload Instead
      </button>
    </div>
  </div>
);

export default ErrorState;
