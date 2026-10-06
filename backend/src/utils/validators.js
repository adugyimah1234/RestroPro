/**
 * Validates Ghanaian phone numbers.
 * Supports:
 * - Local format: 024XXXXXXX, 050XXXXXXX (10 digits starting with 0)
 * - International format: +23324XXXXXXX or 23324XXXXXXX
 * - Formatted strings with spaces, hyphens, parentheses
 */
function validateGhanaPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Remove spaces, hyphens, dots, parentheses
  const cleaned = phone.replace(/[\s\-\.\(\)]/g, "");
  // Ghana network prefixes after 0, +233, or 233: 20, 23, 24, 25, 26, 27, 28, 50, 53, 54, 55, 56, 57, 59
  const ghanaRegex = /^(?:\+233|233|0)(2[0345678]|5[0345679])\d{7}$/;
  return ghanaRegex.test(cleaned);
}

/**
 * Checks password strength:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character
 */
function checkPasswordRequirements(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false };
  }
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~]/.test(password);

  const isValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
  return { isValid, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
}

module.exports = {
  validateGhanaPhone,
  checkPasswordRequirements
};
