
export const isValidName = (name) => /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s'-]+$/.test(name.trim());

export const isValidPhone = (phone) => /^05\d{9}$/.test(phone);

export const isValidPostalCode = (postalCode) => /^\d{5}$/.test(postalCode);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidTcNo = (tcNo) => /^[1-9][0-9]{10}$/.test(tcNo);