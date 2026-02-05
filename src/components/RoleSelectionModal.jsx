import React from 'react';
import { User, Shield } from 'lucide-react';

const RoleSelectionModal = ({ onSelectRole, onClose }) => {
  const roles = [
    {
      id: 'advisor',
      name: 'Advisor',
      description: 'Create and manage applications',
      icon: User,
      color: 'blue'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'View all applications and oversee platform',
      icon: Shield,
      color: 'purple'
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Role</h2>
        <p className="text-gray-600 mb-6">Choose how you want to access the platform</p>
        
        <div className="space-y-3">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${role.color}-100`}>
                    <IconComponent className={`w-5 h-5 text-${role.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
