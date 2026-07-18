
export const isValidName = (name) => /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s'-]+$/.test(name.trim());

export const isValidPhone = (phone) => /^05\d{9}$/.test(phone);

export const isValidPostalCode = (postalCode) => /^\d{5}$/.test(postalCode);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Format kontrolünün ötesinde resmi TC Kimlik No checksum algoritmasını da
// uygular (10. ve 11. haneler) — daha önce sadece "11 haneli, 0 ile başlamıyor"
// kontrolü yapılıyordu, algoritmik olarak geçersiz ama formata uyan bir
// numara (ör. 12345678901) sorunsuz geçebiliyordu.
export const isValidTcNo = (tcNo) => {
  if (typeof tcNo !== "string" || !/^[1-9][0-9]{10}$/.test(tcNo)) return false;
  const d = tcNo.split("").map(Number);
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  const digit10 = (((oddSum * 7) - evenSum) % 10 + 10) % 10;
  if (digit10 !== d[9]) return false;
  const sumFirst10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  const digit11 = sumFirst10 % 10;
  return digit11 === d[10];
};

export const isValidAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]/u;
  
  return address.trim().length >= 10 && !emojiRegex.test(address);
};