import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Reusable Section Header Component
export const SectionHeader = ({ icon: Icon, title, completed = true }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`p-2 rounded-full ${completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
      {completed ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    </div>
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
  </div>
);

// Function to check if a value is a base64 image
const isBase64Image = (value) => {
  if (typeof value !== 'string') return false;
  return value.startsWith('data:image/') && value.includes('base64,');
};

// Reusable Info Row Component with two columns
export const InfoRow = ({ label, value, label2, value2, className = "" }) => {
  // Function to render value with image preview support
  const renderValue = (val, lbl) => {
    if (isBase64Image(val)) {
      return (
        <div className="mt-2">
          <div className="border border-gray-200 rounded-lg p-2 inline-block max-w-full">
            <img 
              src={val} 
              alt={lbl || 'Document image'} 
              className="max-h-40 max-w-full object-contain rounded"
            />
          </div>
        </div>
      );
    }
    
    // Handle objects by rendering their properties
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const entries = Object.entries(val);
      return (
        <div className="space-y-1 text-sm">
          {entries.map(([key, value]) => (
            <div key={key}>
              <span className="text-gray-600">{formatLabel(key)}:</span>{' '}
              <span className="text-gray-800">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                 typeof value === 'object' ? JSON.stringify(value) : 
                 String(value || 'N/A')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    return val || val === 0 || val === false 
      ? (typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)) 
      : 'N/A';
  };

  return (
    <div className={`w-full flex flex-wrap mb-4 ${className}`}>
      <div className="w-full md:w-1/2 pr-4">
        <div className="border-b border-gray-100 pb-2">
          <dt className="text-sm font-medium text-gray-600">{label}</dt>
          <dd className="text-gray-800 break-words">
            {renderValue(value, label)}
          </dd>
        </div>
      </div>
      {label2 && (
        <div className="w-full md:w-1/2 pl-4">
          <div className="border-b border-gray-100 pb-2">
            <dt className="text-sm font-medium text-gray-600">{label2}</dt>
            <dd className="text-gray-800 break-words">
              {renderValue(value2, label2)}
            </dd>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable List Section Component
export const ListSection = ({ title, items, emptyMessage = "No items added" }) => {
  if (!items || items.length === 0) return null;
  
  const formatChildData = (child) => {
    return (
      <div className="border border-gray-100 rounded p-3 mb-3">
        <h5 className="font-medium text-gray-800 mb-2">{child.fullName || 'Unnamed Child'}</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {child.dob && <div><span className="text-gray-600">Date of Birth:</span> {child.dob}</div>}
          {child.relationshipClient1 && <div><span className="text-gray-600">Relationship to Client 1:</span> {child.relationshipClient1}</div>}
          {child.relationshipClient2 && <div><span className="text-gray-600">Relationship to Client 2:</span> {child.relationshipClient2}</div>}
          {child.address && (
            <div className="md:col-span-2">
              <div className="text-gray-600">Address:</div>
              <div className="whitespace-pre-line">{child.address}</div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="mt-4">
      <h4 className="font-medium text-gray-700 mb-3">{title}</h4>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="text-gray-700">
            {title.toLowerCase().includes('children') && typeof item === 'object' 
              ? formatChildData(item) 
              : (typeof item === 'object' && item !== null && !Array.isArray(item) ? (
                  <div className="space-y-1 text-sm">
                    {Object.entries(item).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{formatLabel(key)}:</span>{' '}
                        <span className="text-gray-800">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                           typeof value === 'object' ? JSON.stringify(value) : 
                           String(value || 'N/A')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : String(item || 'N/A'))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Reusable Collapsible Section Component
export const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

// Helper function to format object keys for display
export const formatLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Client1', 'Client 1')
    .replace('Client2', 'Client 2');
};
