// Simple email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate required field
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

// Validate minimum length
export const minLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};
