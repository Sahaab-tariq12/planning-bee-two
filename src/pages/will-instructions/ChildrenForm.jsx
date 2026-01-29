import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { validateField } from "../../utils/validation";
import ChildForm from "./ChildForm";
import { useAppContext } from "../../context/AppContext";
import Dropdown from "../../components/Dropdown";
import Input from "../../components/Input";

const ChildrenForm = ({ onValidationChange }) => {
  const { willInstructions, updateState } = useAppContext();
  const [children, setChildren] = useState(willInstructions.children || []);
  const [hasDisinheritance, setHasDisinheritance] = useState(willInstructions.hasDisinheritance || false);
  const [disinheritedChildren, setDisinheritedChildren] = useState(willInstructions.disinheritedChildren || []);
  const [newDisinheritedPerson, setNewDisinheritedPerson] = useState({
    name: "",
    relationship: ""
  });
  const [hasChildrenConcerns, setHasChildrenConcerns] = useState(willInstructions.hasChildrenConcerns || false);
  const [childrenConcernsDetails, setChildrenConcernsDetails] = useState(willInstructions.childrenConcernsDetails || '');
  const [childErrors, setChildErrors] = useState({});

  // Validation rules
  const validationRules = {
    title: { required: true },
    fullName: { required: true, minLength: 2 },
    dob: {}, // Made DOB optional by removing required: true
    relationshipClient1: { required: true },
    address: { required: true, minLength: 5 },
    disinheritedName: { required: true, minLength: 2 },
    disinheritedRelationship: { required: true }
  };

  const RELATIONSHIP_OPTIONS = [
    { value: "son", label: "Son" },
    { value: "stepson", label: "Stepson" },
    { value: "daughter", label: "Daughter" },
    { value: "stepdaughter", label: "Step Daughter" },
    { value: "partners_son", label: "Partner's Son" },
    { value: "partners_daughter", label: "Partner's Daughter" },
    // { value: "other", label: "Other (Please specify)" }
  ];

  const validateChild = (child) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      if (field in child) {
        const error = validateField(field, child[field], validationRules[field]);
        if (error) {
          newErrors[`${child.id}-${field}`] = error;
        }
      }
    });
    
    return newErrors;
  };

  const handleAddChild = () => {
    const newChild = {
      id: Date.now(),
      title: "",
      fullName: "",
      dob: "",
      relationshipClient1: "",
      relationshipClient2: "",
      address: "",
    };
    
    const updatedChildren = [...children, newChild];
    setChildren(updatedChildren);
    updateState('willInstructions', { 
      ...willInstructions, 
      children: updatedChildren 
    });
  };

  const handleRemoveChild = (id) => {
    const updatedChildren = children.filter((child) => child.id !== id);
    setChildren(updatedChildren);
    
    // Remove any errors for this child
    setChildErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${id}-`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
    
    // Remove from disinherited children if present
    const updatedDisinherited = disinheritedChildren.filter(item => item.id !== id);
    if (updatedDisinherited.length !== disinheritedChildren.length) {
      setDisinheritedChildren(updatedDisinherited);
    }
    
    updateState('willInstructions', { 
      ...willInstructions, 
      children: updatedChildren,
      disinheritedChildren: updatedDisinherited
    });
  };

  const validateAllChildren = () => {
    let isValid = true;
    const newErrors = {};
    
    children.forEach(child => {
      Object.keys(validationRules).forEach(field => {
        if (field in child) {
          const error = validateField(field, child[field], validationRules[field]);
          if (error) {
            newErrors[`${child.id}-${field}`] = error;
            isValid = false;
          }
        }
      });
    });
    
    setChildErrors(newErrors);
    return isValid;
  };
  
  // Validate all fields when they change
  useEffect(() => {
    const newErrors = {};
    children.forEach(child => {
      Object.keys(validationRules).forEach(field => {
        if (field in child) {
          const error = validateField(field, child[field], validationRules[field]);
          if (error) {
            newErrors[`${child.id}-${field}`] = error;
          }
        }
      });
    });
    
    setChildErrors(newErrors);
  }, [children]);
  
  // Expose validation function to parent
  const isFormValid = useCallback(() => {
    // If no children added, form is valid
    if (children.length === 0) return true;
    
    // If children added, all their required fields must be filled
    for (const child of children) {
      for (const field in validationRules) {
        if (field in child) {
          const error = validateField(field, child[field], validationRules[field]);
          if (error) return false;
        }
      }
    }
    
    // Validate disinherited persons if any
    if (hasDisinheritance) {
      for (const person of disinheritedChildren) {
        if (!person.isExistingChild) {
          if (!person.name || !person.relationship) return false;
        }
      }
    }
    
    return true;
  }, [children, hasDisinheritance, disinheritedChildren]);
  
  // Expose validation state to parent
  useEffect(() => {
    const isValid = isFormValid();
    if (typeof onValidationChange === 'function') {
      onValidationChange(isValid);
    }
  }, [isFormValid, onValidationChange]);

  const updateChildField = (id, field, value) => {
    const updatedChildren = children.map((child) =>
      child.id === id ? { ...child, [field]: value } : child
    );
    
    setChildren(updatedChildren);
    
    // Clear error when field is updated
    const errorKey = `${id}-${field}`;
    if (childErrors[errorKey]) {
      setChildErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
    
    updateState('willInstructions', { 
      ...willInstructions, 
      children: updatedChildren,
      disinheritedChildren
    });
  };

  const handleToggleDisinherited = (childId, isDisinherited) => {
    let updatedDisinherited = [...disinheritedChildren];
    
    if (isDisinherited) {
      const child = children.find(c => c.id === childId);
      if (child && !updatedDisinherited.some(c => c.id === childId)) {
        updatedDisinherited.push({
          id: childId,
          name: child.fullName,
          relationship: child.relationshipClient1,
          isExistingChild: true
        });
      }
    } else {
      updatedDisinherited = updatedDisinherited.filter(item => item.id !== childId);
    }
    
    setDisinheritedChildren(updatedDisinherited);
    updateState('willInstructions', {
      ...willInstructions,
      disinheritedChildren: updatedDisinherited
    });
  };

  const handleAddDisinheritedPerson = () => {
    if (!newDisinheritedPerson.name.trim() || !newDisinheritedPerson.relationship) return;
    
    const newPerson = {
      id: `new-${Date.now()}`,
      name: newDisinheritedPerson.name.trim(),
      relationship: newDisinheritedPerson.relationship,
      isExistingChild: false
    };
    
    const updatedDisinherited = [...disinheritedChildren, newPerson];
    setDisinheritedChildren(updatedDisinherited);
    setNewDisinheritedPerson({ name: "", relationship: "" });
    
    updateState('willInstructions', {
      ...willInstructions,
      disinheritedChildren: updatedDisinherited
    });
  };

  const handleRemoveDisinherited = (id) => {
    const updatedDisinherited = disinheritedChildren.filter(item => item.id !== id);
    setDisinheritedChildren(updatedDisinherited);
  };

  const handleDisinheritedInputChange = (field, value) => {
    setNewDisinheritedPerson(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDisinheritedNameChange = (e) => {
    handleDisinheritedInputChange('name', e.target.value);
  };

  const handleDisinheritedRelationshipChange = (e) => {
    handleDisinheritedInputChange('relationship', e.target.value);
  };

  return (
    <section className="bg-[#F3F4F6] rounded-xl border border-gray-200 p-4 md:p-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h3 className="text-[14px] md:text-lg font-semibold text-[#1a202c]">Children</h3>
          <p className="text-gray-500 text-sm">
            Add details of any children to be included in the will.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddChild}
          className="inline-flex justify-center mt-2 md:mt-0  items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-[#1a202c] bg-white hover:bg-gray-50 transition-colors"
        >
          <FiPlus size={18} />
          Add Child
        </button>
      </div>

      {children.length === 0 ? (
        <div className="mt-4 py-10 px-4 bg-white rounded-lg border border-dashed border-gray-300 text-center text-gray-500 text-sm">
          No children added yet. Click{" "}
          <span className="font-semibold">"Add Child"</span> to include children
          in the will.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {children.map((child, index) => (
            <ChildForm
              key={child.id}
              child={child}
              index={index}
              onUpdate={updateChildField}
              onRemove={handleRemoveChild}
              errors={childErrors}
            />
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-4">
        <div>
          <h3 className="text-[14px] md:text-lg font-semibold text-[#1a202c]">Disinheritance</h3>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-2 md:mt-1 w-3 h-3 md:h-5 md:w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={hasDisinheritance}
            onChange={(e) => {
              const value = e.target.checked;
              setHasDisinheritance(value);
              updateState('willInstructions', { 
                ...willInstructions, 
                hasDisinheritance: value 
              });
            }}
          />
          <div>
            <p className="font-semibold text-[14px] md:text-[16px] text-[#1a202c]">
              Are any of the children to be disinherited?
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Check this box if you want to include a disinheritance clause in the will.
            </p>
          </div>
        </label>

        {hasDisinheritance && (
          <div className="mt-4 pl-4 md:pl-8 border-l-2 border-gray-200">
            <h4 className="font-medium text-[14px] md:text-[16px] text-gray-700 mb-3">Disinherited Persons</h4>
            
            {/* List of existing children to select from */}
            {children.length > 0 && (
              <div className="mb-6">
                <p className="text-xs md:text-sm text-gray-600 mb-2">Select children to disinherit:</p>
                <div className="space-y-2">
                  {children.map((child) => (
                    <label key={child.id} className="flex items-center gap-2 md:p-2 rounded">
                      <input
                        type="checkbox"
                        className="w-3 h-3 md:h-4 md:w-4 text-blue-600 rounded border-gray-300"
                        checked={disinheritedChildren.some(c => c.id === child.id)}
                        onChange={(e) => handleToggleDisinherited(child.id, e.target.checked)}
                      />
                      <span className="text-xs md:text-sm">
                        {child.fullName} ({child.relationshipClient1 || 'No relationship specified'})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add new disinherited person */}
            <div className="mt-6">
              <p className="text-xs md:text-sm font-medium text-gray-700 mb-3">Or add another person to disinherit:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <Input
                    label="Full Name"
                    value={newDisinheritedPerson.name}
                    onChange={handleDisinheritedNameChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="Relationship"
                    value={newDisinheritedPerson.relationship}
                    onChange={handleDisinheritedRelationshipChange}
                    placeholder="Enter relationship"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddDisinheritedPerson}
                    className="w-full inline-flex justify-center items-center px-3 py-3 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newDisinheritedPerson.name.trim() || !newDisinheritedPerson.relationship}
                  >
                    Add Person
                  </button>
                </div>
              </div>
            </div>

            {/* List of disinherited persons */}
            {disinheritedChildren.length > 0 && (
              <div className="mt-6">
                <h5 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Further details about disinheritance:</h5>
                <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-200">
                  {disinheritedChildren.map((person) => (
                    <div key={person.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-900 truncate">{person.name}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-[10px] md:text-xs text-gray-500">
                            {RELATIONSHIP_OPTIONS.find(r => r.value === person.relationship)?.label || person.relationship}
                          </span>
                          {person.isExistingChild && (
                            <span className="ml-2 px-2 py-0.5 text-[6px] md:text-xs rounded-full bg-blue-100 text-blue-800">
                              Existing Child
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDisinherited(person.id)}
                        className="ml-2 p-1.5 text-red-500 rounded-full transition-colors"
                        title="Remove"
                      >
                        <FiTrash2 className="w-3 h-3 md:w-5 md:h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-4">
        <div>
          <h3 className="text-[14px] md:text-lg font-semibold text-[#1a202c]">
            Children&apos;s Concerns
          </h3>
        </div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-2 md:mt-1 w-3 h-3 md:h-5 md:w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={hasChildrenConcerns}
            onChange={(e) => {
              const value = e.target.checked;
              setHasChildrenConcerns(value);
              updateState('willInstructions', { 
                ...willInstructions, 
                hasChildrenConcerns: value,
                childrenConcernsDetails: value ? childrenConcernsDetails : ''
              });
            }}
          />
          <div>
            <p className="font-semibold text-[12px] md:text-[16px] text-[#1a202c]">
              Are there any concerns about children&apos;s relationships, finances,
              disabilities or vulnerabilities?
            </p>
            <p className="text-[10px] md:text-sm text-gray-500">
              Check this box if there are specific concerns that should be
              considered in the will.
            </p>
          </div>
        </label>
        
        {hasChildrenConcerns && (
          <div className="mt-2 ml-5 md:ml-8">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
              Please provide details about your concerns
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={4}
              placeholder="Please describe any concerns about the children's relationships, finances, disabilities, or vulnerabilities..."
              value={childrenConcernsDetails}
              maxLength={400}
              onChange={(e) => {
                const value = e.target.value;
                setChildrenConcernsDetails(value);
                updateState('willInstructions', { 
                  ...willInstructions, 
                  childrenConcernsDetails: value 
                });
              }}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs md:text-sm text-gray-500">
                This information will help us tailor the will to address your specific concerns.
              </p>
              <span className="text-xs text-gray-500">
                {childrenConcernsDetails.length}/400 characters
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChildrenForm;
