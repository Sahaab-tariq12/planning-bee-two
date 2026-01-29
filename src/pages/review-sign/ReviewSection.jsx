import React from 'react';
import { FileText, User, Shield, FileSignature, FileQuestion, Image as ImageIcon } from "lucide-react";
import { Section, SectionHeader, InfoRow, ListSection, formatLabel } from './SectionComponents';

const ReviewSection = ({ formData, formatChildData }) => {
  const {
    clientDetails = {},
    willInstructions = {},
    familyProtection = {},
    lpaInstructions = {},
    idInformation = {},
  } = formData;

  // Function to check if a value is a base64 image
  const isBase64Image = (value) => {
    if (typeof value !== 'string') return false;
    return value.startsWith('data:image/') && value.includes('base64,');
  };

  // Function to render an image preview
  const renderImagePreview = (value, label) => {
    if (!isBase64Image(value)) {
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <ImageIcon className="w-4 h-4" />
          <span>No preview available</span>
        </div>
      );
    }
    
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <div className="border border-gray-200 rounded-lg p-2 inline-block max-w-full">
          <img 
            src={value} 
            alt={label} 
            className="max-h-40 max-w-full object-contain rounded"
          />
        </div>
      </div>
    );
  };

  // Function to render an object's properties as InfoRow components in two columns
  const renderObject = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    
    const entries = Object.entries(obj);
    const rows = [];
    
    // Special handling for financialInfo object
    if (prefix === 'willInstructions.financialInfo' || prefix.includes('financialInfo')) {
      return (
        <div className="space-y-4">
          {/* Assets Section */}
          {obj.assets && Array.isArray(obj.assets) && obj.assets.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Assets</h4>
              <div className="space-y-2">
                {obj.assets.map((asset, idx) => (
                  <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-600">Label:</span> {asset.label || 'N/A'}</div>
                      <div><span className="text-gray-600">Joint:</span> {asset.joint || 'N/A'}</div>
                      <div><span className="text-gray-600">Client 1:</span> {asset.c1 || 'N/A'}</div>
                      <div><span className="text-gray-600">Client 2:</span> {asset.c2 || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Liabilities Section */}
          {obj.liabilities && Array.isArray(obj.liabilities) && obj.liabilities.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Liabilities</h4>
              <div className="space-y-2">
                {obj.liabilities.map((liability, idx) => (
                  <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-600">Label:</span> {liability.label || 'N/A'}</div>
                      <div><span className="text-gray-600">Joint:</span> {liability.joint || 'N/A'}</div>
                      <div><span className="text-gray-600">Client 1:</span> {liability.c1 || 'N/A'}</div>
                      <div><span className="text-gray-600">Client 2:</span> {liability.c2 || 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Calculate and display totals */}
          {obj.assets && Array.isArray(obj.assets) && obj.assets.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <h5 className="font-medium text-gray-700 mb-2">Total Assets</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-600">Joint:</span> £{obj.assets.reduce((sum, asset) => sum + (parseFloat(asset.joint) || 0), 0).toFixed(2)}</div>
                <div><span className="text-gray-600">Client 1:</span> £{obj.assets.reduce((sum, asset) => sum + (parseFloat(asset.c1) || 0), 0).toFixed(2)}</div>
                <div><span className="text-gray-600">Client 2:</span> £{obj.assets.reduce((sum, asset) => sum + (parseFloat(asset.c2) || 0), 0).toFixed(2)}</div>
              </div>
            </div>
          )}
          
          {obj.liabilities && Array.isArray(obj.liabilities) && obj.liabilities.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
              <h5 className="font-medium text-gray-700 mb-2">Total Liabilities</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-600">Joint:</span> £{obj.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.joint) || 0), 0).toFixed(2)}</div>
                <div><span className="text-gray-600">Client 1:</span> £{obj.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c1) || 0), 0).toFixed(2)}</div>
                <div><span className="text-gray-600">Client 2:</span> £{obj.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c2) || 0), 0).toFixed(2)}</div>
              </div>
            </div>
          )}
          
          {/* Net Estate Calculation */}
          {obj.assets && Array.isArray(obj.assets) && obj.assets.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
              <h5 className="font-medium text-gray-700 mb-2">Net Estate</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Joint:</span> £{
                    (obj.assets.reduce((sum, asset) => sum + (parseFloat(asset.joint) || 0), 0) - 
                     (obj.liabilities ? obj.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.joint) || 0), 0) : 0)).toFixed(2)
                  }
                </div>
                <div>
                  <span className="text-gray-600">Client 1:</span> £{
                    (obj.assets.reduce((sum, asset) => sum + (parseFloat(asset.c1) || 0), 0) - 
                     (obj.liabilities ? obj.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c1) || 0), 0) : 0)).toFixed(2)
                  }
                </div>
                <div>
                  <span className="text-gray-600">Client 2:</span> £{
                    (obj.assets.reduce((sum, asset) => sum + (parseFloat(asset.c2) || 0), 0) - 
                     (obj.liabilities ? obj.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c2) || 0), 0) : 0)).toFixed(2)
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Other financial info properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obj.hasForeignProperty !== undefined && (
              <InfoRow label="Has Foreign Property" value={obj.hasForeignProperty ? 'Yes' : 'No'} />
            )}
            {obj.foreignLocation && (
              <InfoRow label="Foreign Location" value={obj.foreignLocation} />
            )}
            {obj.hasForeignWill !== undefined && (
              <InfoRow label="Has Foreign Will" value={obj.hasForeignWill ? 'Yes' : 'No'} />
            )}
            {obj.mentionInThisWill !== undefined && (
              <InfoRow label="Mention in This Will" value={obj.mentionInThisWill ? 'Yes' : 'No'} />
            )}
          </div>
        </div>
      );
    }
    
    // Special handling for client1Executors and client2Executors
    const client1ExecutorsIndex = entries.findIndex(([key]) => key === 'client1Executors');
    if (client1ExecutorsIndex !== -1) {
      const [key, value] = entries[client1ExecutorsIndex];
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Client 1 Executors</h4>
            <div className="space-y-3">
              {value.map((executor, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">Executor {idx + 1}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {executor.title && <div><span className="text-gray-600">Title:</span> {executor.title}</div>}
                    {executor.fullName && <div><span className="text-gray-600">Full Name:</span> {executor.fullName}</div>}
                    {executor.name && <div><span className="text-gray-600">Name:</span> {executor.name}</div>}
                    {executor.relationship && <div><span className="text-gray-600">Relationship:</span> {executor.relationship}</div>}
                    {executor.address && <div><span className="text-gray-600">Address:</span> {executor.address}</div>}
                    {executor.dob && <div><span className="text-gray-600">Date of Birth:</span> {executor.dob}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      entries.splice(client1ExecutorsIndex, 1);
    }
    
    const client2ExecutorsIndex = entries.findIndex(([key]) => key === 'client2Executors');
    if (client2ExecutorsIndex !== -1) {
      const [key, value] = entries[client2ExecutorsIndex];
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Client 2 Executors</h4>
            <div className="space-y-3">
              {value.map((executor, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">Executor {idx + 1}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {executor.title && <div><span className="text-gray-600">Title:</span> {executor.title}</div>}
                    {executor.fullName && <div><span className="text-gray-600">Full Name:</span> {executor.fullName}</div>}
                    {executor.name && <div><span className="text-gray-600">Name:</span> {executor.name}</div>}
                    {executor.relationship && <div><span className="text-gray-600">Relationship:</span> {executor.relationship}</div>}
                    {executor.address && <div><span className="text-gray-600">Address:</span> {executor.address}</div>}
                    {executor.dob && <div><span className="text-gray-600">Date of Birth:</span> {executor.dob}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      entries.splice(client2ExecutorsIndex, 1);
    }
    
    // Special handling for propertyTrusts array
    const propertyTrustsIndex = entries.findIndex(([key]) => key === 'propertyTrusts');
    if (propertyTrustsIndex !== -1) {
      const [key, value] = entries[propertyTrustsIndex];
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Property Trusts</h4>
            <div className="space-y-3">
              {value.map((trust, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">Property Trust {idx + 1}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {trust.trustType && <div><span className="text-gray-600">Trust Type:</span> {trust.trustType}</div>}
                    {trust.whoRequires && <div><span className="text-gray-600">Who Requires:</span> {trust.whoRequires}</div>}
                    {trust.propertyAddress && <div><span className="text-gray-600">Property Address:</span> {trust.propertyAddress}</div>}
                    {trust.transferToJointNames && <div><span className="text-gray-600">Transfer to Joint Names:</span> {trust.transferToJointNames}</div>}
                    {trust.sevOfTenancyRequired && <div><span className="text-gray-600">Sev of Tenancy Required:</span> {trust.sevOfTenancyRequired}</div>}
                    {trust.periodOfTenancy && <div><span className="text-gray-600">Period of Tenancy:</span> {trust.periodOfTenancy}</div>}
                    {trust.fixedTerm && <div><span className="text-gray-600">Fixed Term:</span> {trust.fixedTerm}</div>}
                    {trust.flexibleLifeInterestTrust && <div><span className="text-gray-600">Flexible Life Interest Trust:</span> {trust.flexibleLifeInterestTrust}</div>}
                    {trust.rightToSubstitute && <div><span className="text-gray-600">Right to Substitute:</span> {trust.rightToSubstitute}</div>}
                    {trust.downsizingSurplus && <div><span className="text-gray-600">Downsizing Surplus:</span> {trust.downsizingSurplus}</div>}
                    {trust.trustPeriodEnds && <div><span className="text-gray-600">Trust Period Ends:</span> {trust.trustPeriodEnds}</div>}
                    {trust.trustPeriodEndsOther && <div><span className="text-gray-600">Trust Period Ends Other:</span> {trust.trustPeriodEndsOther}</div>}
                  </div>
                  
                  {/* Occupant Life Tenant within Property Trust */}
                  {trust.occupantLifeTenant && typeof trust.occupantLifeTenant === 'object' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="font-medium text-gray-700 mb-2">Occupant Life Tenant</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {trust.occupantLifeTenant.client1 !== undefined && (
                          <div><span className="text-gray-600">Client 1:</span> {trust.occupantLifeTenant.client1 ? 'Yes' : 'No'}</div>
                        )}
                        {trust.occupantLifeTenant.client2 !== undefined && (
                          <div><span className="text-gray-600">Client 2:</span> {trust.occupantLifeTenant.client2 ? 'Yes' : 'No'}</div>
                        )}
                        {trust.occupantLifeTenant.both !== undefined && (
                          <div><span className="text-gray-600">Both:</span> {trust.occupantLifeTenant.both ? 'Yes' : 'No'}</div>
                        )}
                        {trust.occupantLifeTenant.other !== undefined && (
                          <div><span className="text-gray-600">Other:</span> {trust.occupantLifeTenant.other ? 'Yes' : 'No'}</div>
                        )}
                        {trust.occupantLifeTenant.otherName && (
                          <div><span className="text-gray-600">Other Name:</span> {trust.occupantLifeTenant.otherName}</div>
                        )}
                        {trust.occupantLifeTenant.otherDetails && (
                          <div className="md:col-span-2">
                            <div className="text-gray-600">Other Details:</div>
                            <div className="whitespace-pre-line">{trust.occupantLifeTenant.otherDetails}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Life Tenant Ends On */}
                  {trust.lifeTenantEndsOn && typeof trust.lifeTenantEndsOn === 'object' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="font-medium text-gray-700 mb-2">Life Tenant Ends On</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {trust.lifeTenantEndsOn.cohabitation !== undefined && (
                          <div><span className="text-gray-600">Cohabitation:</span> {trust.lifeTenantEndsOn.cohabitation ? 'Yes' : 'No'}</div>
                        )}
                        {trust.lifeTenantEndsOn.marriage !== undefined && (
                          <div><span className="text-gray-600">Marriage:</span> {trust.lifeTenantEndsOn.marriage ? 'Yes' : 'No'}</div>
                        )}
                        {trust.lifeTenantEndsOn.age !== undefined && (
                          <div><span className="text-gray-600">Age:</span> {trust.lifeTenantEndsOn.age ? 'Yes' : 'No'}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      // Remove propertyTrusts from entries so it doesn't get processed again
      entries.splice(propertyTrustsIndex, 1);
    }

    // Special handling for disinheritedChildren array
    const disinheritedChildrenIndex = entries.findIndex(([key]) => key === 'disinheritedChildren');
    if (disinheritedChildrenIndex !== -1) {
      const [key, value] = entries[disinheritedChildrenIndex];
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Disinherited Children</h4>
            <div className="space-y-3">
              {value.map((child, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">{child.name || 'Unnamed Child'}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {child.name && <div><span className="text-gray-600">Name:</span> {child.name}</div>}
                    {child.relationship && <div><span className="text-gray-600">Relationship:</span> {child.relationship}</div>}
                    {child.isExistingChild !== undefined && <div><span className="text-gray-600">Is Existing Child:</span> {child.isExistingChild ? 'Yes' : 'No'}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      entries.splice(disinheritedChildrenIndex, 1);
    }

    // Special handling for funeralWishes object
    const funeralWishesIndex = entries.findIndex(([key]) => key === 'funeralWishes');
    if (funeralWishesIndex !== -1) {
      const [key, value] = entries[funeralWishesIndex];
      if (typeof value === 'object' && value !== null) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Funeral Wishes</h4>
            <div className="space-y-4">
              {value.client1Wishes && typeof value.client1Wishes === 'object' && (
                <div>
                  <h5 className="font-medium text-gray-600 mb-2">Client 1 Wishes</h5>
                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {value.client1Wishes.cremation !== undefined && <div><span className="text-gray-600">Cremation:</span> {value.client1Wishes.cremation ? 'Yes' : 'No'}</div>}
                      {value.client1Wishes.burial !== undefined && <div><span className="text-gray-600">Burial:</span> {value.client1Wishes.burial ? 'Yes' : 'No'}</div>}
                      {value.client1Wishes.undecided !== undefined && <div><span className="text-gray-600">Undecided:</span> {value.client1Wishes.undecided ? 'Yes' : 'No'}</div>}
                      {value.client1Wishes.other !== undefined && <div><span className="text-gray-600">Other:</span> {value.client1Wishes.other ? 'Yes' : 'No'}</div>}
                    </div>
                  </div>
                </div>
              )}
              {value.client1Other && (
                <div>
                  <h5 className="font-medium text-gray-600 mb-2">Client 1 Other Wishes</h5>
                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <div className="text-sm">
                      <div className="whitespace-pre-line">{value.client1Other}</div>
                    </div>
                  </div>
                </div>
              )}
              {value.additionalWishes && (
                <div>
                  <h5 className="font-medium text-gray-600 mb-2">Additional Wishes</h5>
                  <div className="border border-gray-100 rounded p-3 bg-gray-50">
                    <div className="text-sm">
                      <div className="whitespace-pre-line">{value.additionalWishes}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      entries.splice(funeralWishesIndex, 1);
    }

    // Special handling for children array
    const childrenIndex = entries.findIndex(([key]) => key === 'children');
    if (childrenIndex !== -1) {
      const [key, value] = entries[childrenIndex];
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Children</h4>
            <div className="space-y-3">
              {value.map((child, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">{child.fullName || 'Unnamed Child'}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {child.title && <div><span className="text-gray-600">Title:</span> {child.title}</div>}
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
              ))}
            </div>
          </div>
        );
      }
      // Remove children from entries so it doesn't get processed again
      entries.splice(childrenIndex, 1);
    }

    // Special handling for financialInfo object
    const financialInfoIndex = entries.findIndex(([key]) => key === 'financialInfo');
    if (financialInfoIndex !== -1) {
      const [key, value] = entries[financialInfoIndex];
      if (value && typeof value === 'object') {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Financial Information</h4>
            <div className="space-y-4">
              {/* Assets Section */}
              {value.assets && Array.isArray(value.assets) && value.assets.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-600 mb-2">Assets</h5>
                  <div className="space-y-2">
                    {value.assets.map((asset, idx) => (
                      <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-600">Label:</span> {asset.label || 'N/A'}</div>
                          <div><span className="text-gray-600">Joint:</span> {asset.joint || 'N/A'}</div>
                          <div><span className="text-gray-600">Client 1:</span> {asset.c1 || 'N/A'}</div>
                          <div><span className="text-gray-600">Client 2:</span> {asset.c2 || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Liabilities Section */}
              {value.liabilities && Array.isArray(value.liabilities) && value.liabilities.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-600 mb-2">Liabilities</h5>
                  <div className="space-y-2">
                    {value.liabilities.map((liability, idx) => (
                      <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-gray-600">Label:</span> {liability.label || 'N/A'}</div>
                          <div><span className="text-gray-600">Joint:</span> {liability.joint || 'N/A'}</div>
                          <div><span className="text-gray-600">Client 1:</span> {liability.c1 || 'N/A'}</div>
                          <div><span className="text-gray-600">Client 2:</span> {liability.c2 || 'N/A'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Calculate and display totals */}
              {value.assets && Array.isArray(value.assets) && value.assets.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <h5 className="font-medium text-gray-700 mb-2">Total Assets</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-600">Joint:</span> £{value.assets.reduce((sum, asset) => sum + (parseFloat(asset.joint) || 0), 0).toFixed(2)}</div>
                    <div><span className="text-gray-600">Client 1:</span> £{value.assets.reduce((sum, asset) => sum + (parseFloat(asset.c1) || 0), 0).toFixed(2)}</div>
                    <div><span className="text-gray-600">Client 2:</span> £{value.assets.reduce((sum, asset) => sum + (parseFloat(asset.c2) || 0), 0).toFixed(2)}</div>
                  </div>
                </div>
              )}
              
              {value.liabilities && Array.isArray(value.liabilities) && value.liabilities.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                  <h5 className="font-medium text-gray-700 mb-2">Total Liabilities</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div><span className="text-gray-600">Joint:</span> £{value.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.joint) || 0), 0).toFixed(2)}</div>
                    <div><span className="text-gray-600">Client 1:</span> £{value.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c1) || 0), 0).toFixed(2)}</div>
                    <div><span className="text-gray-600">Client 2:</span> £{value.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c2) || 0), 0).toFixed(2)}</div>
                  </div>
                </div>
              )}
              
              {/* Net Estate Calculation */}
              {value.assets && Array.isArray(value.assets) && value.assets.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <h5 className="font-medium text-gray-700 mb-2">Net Estate</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Joint:</span> £{
                        (value.assets.reduce((sum, asset) => sum + (parseFloat(asset.joint) || 0), 0) - 
                         (value.liabilities ? value.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.joint) || 0), 0) : 0)).toFixed(2)
                      }
                    </div>
                    <div>
                      <span className="text-gray-600">Client 1:</span> £{
                        (value.assets.reduce((sum, asset) => sum + (parseFloat(asset.c1) || 0), 0) - 
                         (value.liabilities ? value.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c1) || 0), 0) : 0)).toFixed(2)
                      }
                    </div>
                    <div>
                      <span className="text-gray-600">Client 2:</span> £{
                        (value.assets.reduce((sum, asset) => sum + (parseFloat(asset.c2) || 0), 0) - 
                         (value.liabilities ? value.liabilities.reduce((sum, liability) => sum + (parseFloat(liability.c2) || 0), 0) : 0)).toFixed(2)
                      }
                    </div>
                  </div>
                </div>
              )}
              
              {/* Other financial info properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {value.hasForeignProperty !== undefined && (
                  <InfoRow label="Has Foreign Property" value={value.hasForeignProperty ? 'Yes' : 'No'} />
                )}
                {value.foreignLocation && (
                  <InfoRow label="Foreign Location" value={value.foreignLocation} />
                )}
                {value.hasForeignWill !== undefined && (
                  <InfoRow label="Has Foreign Will" value={value.hasForeignWill ? 'Yes' : 'No'} />
                )}
                {value.mentionInThisWill !== undefined && (
                  <InfoRow label="Mention in This Will" value={value.mentionInThisWill ? 'Yes' : 'No'} />
                )}
              </div>
            </div>
          </div>
        );
      }
      // Remove financialInfo from entries so it doesn't get processed again
      entries.splice(financialInfoIndex, 1);
    }
    
    // Special handling for alternateGroups array
    const alternateGroupsIndex = entries.findIndex(([key]) => key === 'alternateGroups');
    if (alternateGroupsIndex !== -1) {
      const [key, value] = entries[alternateGroupsIndex];
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Alternate Groups</h4>
            <div className="space-y-3">
              {value.map((group, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">Alternate Group {idx + 1}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {group.id && <div><span className="text-gray-600">Id:</span> {group.id}</div>}
                    {group.percentage && <div><span className="text-gray-600">Percentage:</span> {group.percentage}</div>}
                    {group.type && <div><span className="text-gray-600">Type:</span> {group.type}</div>}
                    {group.giftOverToChildren !== undefined && (
                      <div><span className="text-gray-600">Gift Over To Children:</span> {group.giftOverToChildren ? 'Yes' : 'No'}</div>
                    )}
                    {group.accruer !== undefined && (
                      <div><span className="text-gray-600">Accruer:</span> {group.accruer ? 'Yes' : 'No'}</div>
                    )}
                    {group.otherEntities && (
                      <div><span className="text-gray-600">Other Entities:</span> {group.otherEntities}</div>
                    )}
                  </div>
                  
                  {/* Beneficiaries within Alternate Group */}
                  {group.beneficiaries && Array.isArray(group.beneficiaries) && group.beneficiaries.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h6 className="font-medium text-gray-700 mb-2">Beneficiaries</h6>
                      <div className="space-y-2">
                        {group.beneficiaries.map((beneficiary, bidx) => (
                          <div key={bidx} className="border border-gray-50 rounded p-2 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {beneficiary.name && <div><span className="text-gray-600">Name:</span> {beneficiary.name}</div>}
                              {beneficiary.relationship && <div><span className="text-gray-600">Relationship:</span> {beneficiary.relationship}</div>}
                              {beneficiary.classGift && <div><span className="text-gray-600">Class Gift:</span> {beneficiary.classGift}</div>}
                              {beneficiary.ageOfVesting && <div><span className="text-gray-600">Age of Vesting:</span> {beneficiary.ageOfVesting}</div>}
                              {beneficiary.address && (
                                <div className="md:col-span-2">
                                  <div className="text-gray-600">Address:</div>
                                  <div className="whitespace-pre-line">{beneficiary.address}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      // Remove alternateGroups from entries so it doesn't get processed again
      entries.splice(alternateGroupsIndex, 1);
    }

    // Special handling for percentageGroups - process it separately first
    const percentageGroupsIndex = entries.findIndex(([key]) => key === 'percentageGroups');
    if (percentageGroupsIndex !== -1) {
      const [key, value] = entries[percentageGroupsIndex];
      const label = formatLabel(key);
      
      if (Array.isArray(value) && value.length > 0) {
        rows.push(
          <div key={key} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">{label}</h4>
            <div className="space-y-3">
              {value.map((group, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Percentage" value={group.percentage ? `${group.percentage}%` : 'N/A'} />
                    <InfoRow label="Type" value={group.type || 'N/A'} />
                    <InfoRow 
                      label="Further Details" 
                      value={group.furtherDetails || 'N/A'} 
                      className="md:col-span-2" 
                    />
                  </div>
                  {group.beneficiaries && group.beneficiaries.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-600 mb-2">Beneficiaries</h5>
                      <div className="space-y-2 pl-4">
                        {group.beneficiaries.map((beneficiary, bidx) => (
                          <div key={bidx} className="border border-gray-50 rounded p-2 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <InfoRow label="Name" value={beneficiary.name || 'N/A'} />
                              <InfoRow label="Relationship" value={beneficiary.relationship || 'N/A'} />
                              <InfoRow label="Class Gift" value={beneficiary.classGift || 'N/A'} />
                              <InfoRow label="Age of Vesting" value={beneficiary.ageOfVesting || 'N/A'} />
                              <InfoRow 
                                label="Address" 
                                value={beneficiary.address || 'N/A'} 
                                className="md:col-span-2" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // Remove percentageGroups from entries so it doesn't get processed again
      entries.splice(percentageGroupsIndex, 1);
    }
    
    // Group remaining entries into pairs
    for (let i = 0; i < entries.length; i += 2) {
      const [key1, value1] = entries[i];
      const [key2, value2] = entries[i + 1] || [];
      
      const label1 = formatLabel(key1);
      const label2 = key2 ? formatLabel(key2) : null;
      const fullKey1 = prefix ? `${prefix}.${key1}` : key1;
      const fullKey2 = key2 ? (prefix ? `${prefix}.${key2}` : key2) : null;
      
      // Skip if both values are empty
      if ((value1 === null || value1 === undefined || value1 === '') && 
          (!key2 || value2 === null || value2 === undefined || value2 === '')) {
        continue;
      }
      
      // Handle ID document images
      if ((key1 === 'idFront' || key1 === 'idBack' || key1 === 'selfie') && isBase64Image(value1)) {
        rows.push(
          <div key={fullKey1} className="w-full mb-4">
            {renderImagePreview(value1, label1)}
          </div>
        );
        continue;
      }
      
      if (Array.isArray(value1) && value1.length > 0) {
        rows.push(
          <div key={fullKey1} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">{label1}</h4>
            <div className="space-y-3">
              {value1.map((item, idx) => (
                <div key={idx} className="border border-gray-100 rounded p-3">
                  {label1.toLowerCase().includes('children') && typeof item === 'object'
                    ? <div className="border border-gray-50 rounded p-2">
                        <h5 className="font-medium text-gray-800 mb-2">{item.fullName || 'Unnamed Child'}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {item.dob && <div><span className="text-gray-600">Date of Birth:</span> {item.dob}</div>}
                          {item.relationshipClient1 && <div><span className="text-gray-600">Relationship to Client 1:</span> {item.relationshipClient1}</div>}
                          {item.relationshipClient2 && <div><span className="text-gray-600">Relationship to Client 2:</span> {item.relationshipClient2}</div>}
                          {item.address && (
                            <div className="md:col-span-2">
                              <div className="text-gray-600">Address:</div>
                              <div className="whitespace-pre-line">{item.address}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    : label1.toLowerCase().includes('financial') && typeof item === 'object'
                    ? <div className="border border-gray-50 rounded p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {item.type && <div><span className="text-gray-600">Type:</span> {item.type}</div>}
                          {item.value && <div><span className="text-gray-600">Value:</span> {item.value}</div>}
                          {item.description && <div><span className="text-gray-600">Description:</span> {item.description}</div>}
                          {item.details && (
                            <div className="md:col-span-2">
                              <div className="text-gray-600">Details:</div>
                              <div className="whitespace-pre-line">{item.details}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    : label1.toLowerCase().includes('executor') && typeof item === 'object'
                    ? <div className="border border-gray-50 rounded p-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {item.title && <div><span className="text-gray-600">Title:</span> {item.title}</div>}
                          {item.fullName && <div><span className="text-gray-600">Full Name:</span> {item.fullName}</div>}
                          {item.name && <div><span className="text-gray-600">Name:</span> {item.name}</div>}
                          {item.relationship && <div><span className="text-gray-600">Relationship:</span> {item.relationship}</div>}
                          {item.address && <div><span className="text-gray-600">Address:</span> {item.address}</div>}
                          {item.dob && <div><span className="text-gray-600">Date of Birth:</span> {item.dob}</div>}
                        </div>
                      </div>
                    : (typeof item === 'object' ? renderObject(item, `${fullKey1}[${idx}]`) : String(item))}
                </div>
              ))}
            </div>
          </div>
        );
        continue;
      } else if (typeof value1 === 'object' && value1 !== null) {
        rows.push(
          <div key={fullKey1} className="w-full mt-4">
            <h4 className="font-medium text-gray-700 mb-2">{label1}</h4>
            <div className="pl-4 border-l-2 border-gray-100">
              {renderObject(value1, fullKey1)}
            </div>
          </div>
        );
      } else {
        rows.push(
          <InfoRow
            key={fullKey1}
            label={label1}
            value={value1}
            label2={label2}
            value2={value2}
          />
        );
      }
    }
    
    return rows;
  };

  return (
    <div className="space-y-6">
      {/* Client Details Section */}
      <Section title="Client Details" icon={User}>
        <div className="space-y-6">
          {/* Client 1 Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Client 1 Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Title" value={clientDetails.title} />
              <InfoRow label="First Name" value={clientDetails.firstName} />
              <InfoRow label="Last Name" value={clientDetails.lastName} />
              <InfoRow label="Email" value={clientDetails.email} />
              <InfoRow label="Mobile" value={clientDetails.mobile} />
              <InfoRow label="Telephone" value={clientDetails.telephone} />
              <InfoRow label="Date of Birth" value={clientDetails.dob} />
              <InfoRow label="Marital Status" value={clientDetails.maritalStatus} />
              <InfoRow label="Address" value={clientDetails.address} />
              <InfoRow label="Address Line 2" value={clientDetails.address2} />
              <InfoRow label="Previous Will" value={clientDetails.previousWill ? "Yes" : "No"} />
              <InfoRow label="Case Notes" value={clientDetails.caseNotes} />
            </div>
          </div>

          {/* Client 2 Section - Only show if client2 data exists */}
          {(clientDetails.firstName2 || clientDetails.email2) && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Client 2 Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Title" value={clientDetails.title2} />
                <InfoRow label="First Name" value={clientDetails.firstName2} />
                <InfoRow label="Last Name" value={clientDetails.lastName2} />
                <InfoRow label="Email" value={clientDetails.email2} />
                <InfoRow label="Mobile" value={clientDetails.mobile2} />
                <InfoRow label="Telephone" value={clientDetails.telephone2} />
                <InfoRow label="Date of Birth" value={clientDetails.dob2} />
                <InfoRow label="Marital Status" value={clientDetails.maritalStatus2} />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Services Required Section */}
      {clientDetails.servicesRequired && (
        <Section title="Services Required" icon={FileText}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'wills', label: 'Wills' },
                { id: 'lpas', label: 'LPAs' },
                { id: 'discTrust', label: 'Disc Trust' },
                { id: 'ppt', label: 'PPT' },
                { id: 'bprt', label: 'BPRT' },
                { id: 'fpt', label: 'FPT' },
                { id: 'flit', label: 'FLIT' },
                { id: 'vpt', label: 'VPT' },
              ].map((service) => (
                <div key={service.id} className="flex items-center space-x-2">
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                    clientDetails.servicesRequired.selectedServices?.includes(service.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {clientDetails.servicesRequired.selectedServices?.includes(service.id) && (
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{service.label}</span>
                </div>
              ))}
            </div>
            
            {clientDetails.servicesRequired.otherServices && clientDetails.servicesRequired.otherServices.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Other Services</h4>
                <div className="flex flex-wrap gap-2">
                  {clientDetails.servicesRequired.otherServices.map((service, index) => (
                    <div key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                      {service}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Will Instructions Section */}
      <Section title="Will Instructions" icon={FileText}>
        {renderObject(willInstructions)}
      </Section>

      {/* Family Protection Section */}
      <Section title="Family Protection" icon={Shield}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Require Trust" value={familyProtection.requireTrust || 'N/A'} />
            <InfoRow label="Client 1 NI" value={familyProtection.client1NI || 'N/A'} />
            <InfoRow label="Client 2 NI" value={familyProtection.client2NI || 'N/A'} />
            <InfoRow label="Clients as Trustees" value={familyProtection.clientsAsTrustees ? 'Yes' : 'No'} />
            <InfoRow label="Mortgage or Equity" value={familyProtection.mortgageOrEquity ? 'Yes' : 'No'} />
            <InfoRow label="RX1 or TR1" value={familyProtection.rx1OrTr1 || 'N/A'} />
            <InfoRow 
              label="Additional Info" 
              value={familyProtection.additionalInfo || 'N/A'} 
              className="md:col-span-2" 
            />
          </div>
          
          {/* Settlors Section */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Settlors</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Client 1</p>
                  <p className="text-gray-800">
                    {familyProtection.settlors?.client1 ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Client 2</p>
                  <p className="text-gray-800">
                    {familyProtection.settlors?.client2 ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-600">Both</p>
                  <p className="text-gray-800">
                    {familyProtection.settlors?.both ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Client 1 Trustees */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Client 1 Trustees</h4>
            {familyProtection.client1Trustees?.length > 0 ? (
              <div className="space-y-3">
                {familyProtection.client1Trustees.map((trustee, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Title" value={trustee.title || 'N/A'} />
                      <InfoRow label="Full Name" value={trustee.fullName || 'N/A'} />
                      <InfoRow label="Relationship" value={trustee.relationship || 'N/A'} />
                      <InfoRow 
                        label="Address" 
                        value={trustee.address || 'N/A'} 
                        className="md:col-span-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No trustees added</p>
            )}
          </div>
          
          {/* Client 2 Trustees */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Client 2 Trustees</h4>
            {familyProtection.client2Trustees?.length > 0 ? (
              <div className="space-y-3">
                {familyProtection.client2Trustees.map((trustee, index) => (
                  <div key={`client2-${index}`} className="bg-gray-50 p-3 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow label="Title" value={trustee.title || 'N/A'} />
                      <InfoRow label="Full Name" value={trustee.fullName || 'N/A'} />
                      <InfoRow label="Relationship" value={trustee.relationship || 'N/A'} />
                      <InfoRow 
                        label="Address" 
                        value={trustee.address || 'N/A'} 
                        className="md:col-span-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No trustees added</p>
            )}
          </div>
          
          {/* Trust Reasons */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Trust Reasons</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow 
                  label="Reduce Probate" 
                  value={familyProtection.trustReasons?.reduceProbate ? 'Yes' : 'No'} 
                />
                <InfoRow 
                  label="Sideways Disinheritance" 
                  value={familyProtection.trustReasons?.sidewaysDisinheritance ? 'Yes' : 'No'} 
                />
                <InfoRow 
                  label="Divorce Claims" 
                  value={familyProtection.trustReasons?.divorceClaims ? 'Yes' : 'No'} 
                />
                <InfoRow 
                  label="Generational IHT" 
                  value={familyProtection.trustReasons?.generationalIHT ? 'Yes' : 'No'} 
                />
                <InfoRow 
                  label="Claims Against Estate" 
                  value={familyProtection.trustReasons?.claimsAgainstEstate ? 'Yes' : 'No'} 
                  className="md:col-span-2"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* LPA Instructions Section */}
      <Section title="LPA Instructions" icon={FileQuestion}>
        {lpaInstructions.client1 && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Client 1 LPA Instructions</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Preferences" value={lpaInstructions.client1.preferences} />
                  <InfoRow label="Certificate Provider" value={lpaInstructions.client1.certificateProvider} />
                  <InfoRow label="Decision Timing" value={lpaInstructions.client1.decisionTiming} />
                  <InfoRow label="Store or Register" value={lpaInstructions.client1.storeOrRegister} />
                  <InfoRow label="Aware of Fee" value={lpaInstructions.client1.awareOfFee ? "Yes" : "No"} />
                </div>
                
                {/* Property Attorneys */}
                {lpaInstructions.client1.propertyAttorneys && lpaInstructions.client1.propertyAttorneys.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Property Attorneys</h4>
                    {lpaInstructions.client1.propertyAttorneys.map((attorney, idx) => (
                      <div key={idx} className="border rounded p-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Title" value={attorney.title} />
                          <InfoRow label="Name" value={attorney.name} />
                          <InfoRow label="Date of Birth" value={attorney.dob} />
                          <InfoRow label="Address" value={attorney.address} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Health Attorneys */}
                {lpaInstructions.client1.healthAttorneys && lpaInstructions.client1.healthAttorneys.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Health Attorneys</h4>
                    {lpaInstructions.client1.healthAttorneys.map((attorney, idx) => (
                      <div key={`health-${idx}`} className="border rounded p-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Title" value={attorney.title} />
                          <InfoRow label="Name" value={attorney.name} />
                          <InfoRow label="Date of Birth" value={attorney.dob} />
                          <InfoRow label="Address" value={attorney.address} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Replacement Attorneys */}
                {lpaInstructions.client1.propertyReplacementAttorneys && lpaInstructions.client1.propertyReplacementAttorneys.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Replacement Attorneys</h4>
                    {lpaInstructions.client1.propertyReplacementAttorneys.map((attorney, idx) => (
                      <div key={`replace-${idx}`} className="border rounded p-3 mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoRow label="Title" value={attorney.title} />
                          <InfoRow label="Name" value={attorney.name} />
                          <InfoRow label="Date of Birth" value={attorney.dob} />
                          <InfoRow label="Address" value={attorney.address} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* ID Information Section */}
      <Section title="ID Information" icon={FileSignature}>
        {/* ID Documents */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ID Documents</h3>
          {idInformation.idDocuments && idInformation.idDocuments.length > 0 ? (
            <div className={`grid ${idInformation.idDocuments.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
              {idInformation.idDocuments.map((doc, index) => (
                <div key={`id-${index}`} className={`border rounded-lg p-4 ${idInformation.idDocuments.length === 1 ? 'w-full' : ''}`}>
                  <h4 className="font-medium text-gray-700 mb-2">Document {index + 1}</h4>
                  <div className="rounded p-4 flex items-center justify-center">
                    <img 
                      src={doc.data} 
                      alt={`ID Document ${index + 1}`}
                      className="max-h-60 max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 truncate">{doc.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No ID documents uploaded</p>
          )}
        </div>

        {/* Supporting Documents */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supporting Documents</h3>
          {idInformation.supportingDocuments && idInformation.supportingDocuments.length > 0 ? (
            <div className={`grid ${idInformation.supportingDocuments.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
              {idInformation.supportingDocuments.map((doc, index) => (
                <div key={`support-${index}`} className={`border rounded-lg p-4 ${idInformation.supportingDocuments.length === 1 ? 'w-full' : ''}`}>
                  <h4 className="font-medium text-gray-700 mb-2">Supporting Document {index + 1}</h4>
                  <div className="rounded p-4 flex items-center justify-center">
                    <img 
                      src={doc.data} 
                      alt={`Supporting Document ${index + 1}`}
                      className="max-h-60 max-w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 truncate">{doc.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No supporting documents uploaded</p>
          )}
        </div>
      </Section>
    </div>
  );
};

export default ReviewSection;
