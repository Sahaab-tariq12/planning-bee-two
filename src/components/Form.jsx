import React from 'react';
import PropTypes from 'prop-types';

const Form = ({
  children,
  onSubmit,
  className = '',
  noValidate = true,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      noValidate={noValidate}
      {...props}
    >
      {children}
    </form>
  );
};

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  className: PropTypes.string,
  noValidate: PropTypes.bool,
};

export default Form;
