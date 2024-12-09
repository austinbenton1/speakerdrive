export const validateName = (name: string) => {
  if (!name.trim()) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be less than 100 characters';
  return undefined;
};

export const validateEmail = (email: string) => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email address';
  return undefined;
};

export const validateTransformation = (text: string) => {
  if (!text.trim()) return 'Transformation description is required';
  if (text.length < 10) return 'Please provide a more detailed description';
  if (text.length > 1000) return 'Description must be less than 1000 characters';
  return undefined;
};