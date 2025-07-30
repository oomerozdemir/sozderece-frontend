
export const isValidName = (name) => /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s'-]+$/.test(name.trim());

export const isValidPhone = (phone) => /^05\d{9}$/.test(phone);

export const isValidPostalCode = (postalCode) => /^\d{5}$/.test(postalCode);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidTcNo = (tcNo) => /^[1-9][0-9]{10}$/.test(tcNo);

export const isValidAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/u;
  return address.trim().length > 10 && !emojiRegex.test(address);
};