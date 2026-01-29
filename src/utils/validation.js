export const validateField = (name, value, validations = {}) => {
  const errors = [];
  const trimmedValue = typeof value === 'string' ? value.trim() : value;

  if (validations.required && !trimmedValue) {
    errors.push('This field is required');
  }

  if (validations.minLength && trimmedValue && trimmedValue.length < validations.minLength) {
    errors.push(`Must be at least ${validations.minLength} characters`);
  }

  if (validations.maxLength && trimmedValue && trimmedValue.length > validations.maxLength) {
    errors.push(`Must be ${validations.maxLength} characters or less`);
  }

  if (validations.email && trimmedValue) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      errors.push('Please enter a valid email address');
    }
  }

  if (validations.pattern && trimmedValue) {
    try {
      // Handle string patterns (from validation rules)
      const regex = typeof validations.pattern === 'string' 
        ? new RegExp(validations.pattern) 
        : validations.pattern;
      if (!regex.test(trimmedValue)) {
        errors.push(validations.patternMessage || 'Invalid format');
      }
    } catch (e) {
      console.error('Invalid regex pattern:', validations.pattern, e);
      errors.push('Invalid format');
    }
  }

  if (validations.min !== undefined && !isNaN(trimmedValue) && Number(trimmedValue) < validations.min) {
    errors.push(`Value must be at least ${validations.min}`);
  }

  if (validations.max !== undefined && !isNaN(trimmedValue) && Number(trimmedValue) > validations.max) {
    errors.push(`Value must be less than or equal to ${validations.max}`);
  }

  return errors[0] || ''; // Return first error or empty string
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const value = formData[field];
    const fieldErrors = validateField(field, value, validationRules[field]);
    
    if (fieldErrors) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export const requiredField = (message = 'This field is required') => ({
  required: true,
  patternMessage: message
});
