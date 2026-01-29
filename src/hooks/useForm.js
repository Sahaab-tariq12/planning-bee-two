import { useState, useCallback } from 'react';
import { validateForm } from '../utils/validation';

export const useForm = (initialState = {}, validationRules = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur if there are validation rules for it
    if (validationRules[name]) {
      const fieldError = validateField(name, value, validationRules[name]);
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  }, [validationRules]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
    setErrors(validationErrors);
    return isValid;
  }, [formData, validationRules]);

  // Set multiple fields at once
  const setFields = useCallback((fields) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  // Get field props for input components
  const getFieldProps = useCallback((name, options = {}) => {
    const fieldValue = formData[name] ?? '';
    const fieldError = errors[name];
    const fieldTouched = touched[name];
    const showError = options.showErrorOnTouched ? fieldTouched && fieldError : fieldError;

    return {
      name,
      value: fieldValue,
      onChange: handleChange,
      onBlur: handleBlur,
      error: showError ? fieldError : undefined,
      ...options
    };
  }, [formData, errors, touched, handleChange, handleBlur]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e) {
      e.preventDefault();
    }

    const isValid = validateAll();
    
    if (isValid) {
      try {
        setIsSubmitting(true);
        await onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, validateAll]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFields,
    resetForm,
    getFieldProps,
    setFormData,
    setErrors,
    validate: validateAll
  };
};

export default useForm;
