import { isValidPhoneNumber, parsePhoneNumberWithError } from "libphonenumber-js";

/**
 * General phone number validation using libphonenumber-js.
 * Validates numbers for Ghana ('GH') or international numbers with country prefix (+).
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;

  try {
    return (
      isValidPhoneNumber(trimmed, "GH") ||
      (trimmed.startsWith("+") && isValidPhoneNumber(trimmed))
    );
  } catch (err) {
    return false;
  }
}

/**
 * Validates Ghanaian phone numbers or international numbers starting with '+'.
 * Uses Google's libphonenumber-js for precise carrier range and length validation.
 */
export function validateGhanaPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;

  try {
    return (
      isValidPhoneNumber(trimmed, "GH") ||
      (trimmed.startsWith("+") && isValidPhoneNumber(trimmed))
    );
  } catch (err) {
    return false;
  }
}

/**
 * Formats a phone number into clean international format (+233 24 XXX XXXX) if valid.
 */
export function formatPhoneNumber(phone, defaultCountry = "GH") {
  if (!phone || typeof phone !== "string") return phone;
  try {
    const parsed = parsePhoneNumberWithError(phone.trim(), defaultCountry);
    if (parsed && parsed.isValid()) {
      return parsed.formatInternational();
    }
  } catch (err) {
    return phone;
  }
  return phone;
}

