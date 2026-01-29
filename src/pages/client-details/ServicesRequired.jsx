import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Lock } from 'lucide-react';

const ServicesRequired = () => {
  const { updateState, clientDetails, reviewSignData } = useAppContext();
  const [selectedServices, setSelectedServices] = useState([]);
  const [otherServicesList, setOtherServicesList] = useState([]);
  const isLoading = useRef(false);

  // Load data from context on component mount
  useEffect(() => {
    if (!isLoading.current && clientDetails.servicesRequired) {
      isLoading.current = true;
      setSelectedServices(clientDetails.servicesRequired.selectedServices || []);
      setOtherServicesList(clientDetails.servicesRequired.otherServices || []);
      setTimeout(() => { isLoading.current = false; }, 100);
    }
  }, [clientDetails]);

  // Sync with review sign data if available
  useEffect(() => {
    if (!isLoading.current && reviewSignData) {
      const servicesFromReview = [];
      
      if (reviewSignData.productsWills) servicesFromReview.push('wills');
      if (reviewSignData.productsLPAs) servicesFromReview.push('lpas');
      if (reviewSignData.productsDiscretionaryTrust) servicesFromReview.push('discTrust');
      if (reviewSignData.productsPropertyProtectionTrust) servicesFromReview.push('ppt');
      if (reviewSignData.productsBPRT) servicesFromReview.push('bprt');
      if (reviewSignData.productsFamilyProtectionTrust) servicesFromReview.push('fpt');
      if (reviewSignData.productsVulnerableDisabilityTrust) servicesFromReview.push('vpt');
      if (reviewSignData.productsRightsOfOccupation) servicesFromReview.push('flit');
      
      const otherServicesFromReview = reviewSignData.productsOtherDetails 
        ? reviewSignData.productsOtherDetails.split(',').map(s => s.trim()).filter(s => s)
        : [];
      
      setSelectedServices(servicesFromReview);
      setOtherServicesList(otherServicesFromReview);
      
      // Update client details with synced data
      updateState('clientDetails', {
        ...clientDetails,
        servicesRequired: {
          selectedServices: servicesFromReview,
          otherServices: otherServicesFromReview
        }
      });
    }
  }, [reviewSignData]);

  const services = [
    { id: 'wills', label: 'Wills' },
    { id: 'lpas', label: 'LPAs' },
    { id: 'discTrust', label: 'Disc Trust' },
    { id: 'ppt', label: 'PPT' },
    { id: 'bprt', label: 'BPRT' },
    { id: 'fpt', label: 'FPT' },
    { id: 'flit', label: 'FLIT' },
    { id: 'vpt', label: 'VPT' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[16px] md:text-lg font-semibold text-gray-900">Services Required</h3>
          <div className="flex items-center gap-2 text-gray-500">
            <Lock size={16} />
            <span className="text-xs md:text-sm">Managed in Review & Sign</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">This section is locked and managed from the Review & Sign page</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {services.map((service) => (
            <label key={service.id} className="flex items-center space-x-2 opacity-60 cursor-not-allowed">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                disabled
                className="w-3 h-3 md:h-5 md:w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs md:text-sm font-medium text-gray-700">{service.label}</span>
            </label>
          ))}
        </div>
        
        {otherServicesList.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Services
            </label>
            <div className="flex flex-wrap gap-2">
              {otherServicesList.map((service, index) => (
                <div 
                  key={index}
                  className="bg-gray-100 text-gray-800 text-xs md:text-sm px-3 py-1 rounded-full flex items-center gap-2 opacity-60"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start gap-2">
            <Lock size={16} className="text-blue-600 mt-0.5" />
            <div>
              <p className="text-xs md:text-sm font-medium text-blue-800">
                Services are managed from the Review & Sign page
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Navigate to the "Products Taken" section in Review & Sign to modify services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesRequired;
