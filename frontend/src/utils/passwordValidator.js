/**
 * Checks password strength against required security criteria:
 * - At least 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*)
 */
export function checkPasswordRequirements(password) {
  const reqs = [
    { id: "length", label: "At least 8 characters", met: Boolean(password && password.length >= 8) },
    { id: "upper", label: "One uppercase letter (A-Z)", met: Boolean(password && /[A-Z]/.test(password)) },
    { id: "lower", label: "One lowercase letter (a-z)", met: Boolean(password && /[a-z]/.test(password)) },
    { id: "number", label: "One number (0-9)", met: Boolean(password && /[0-9]/.test(password)) },
    { id: "special", label: "One special character (!@#$%^&*)", met: Boolean(password && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?~]/.test(password)) }
  ];

  const isValid = reqs.every((r) => r.met);
  return { reqs, isValid };
}

/**
 * Generates a strong, random 16-character password guaranteed to satisfy
 * all security requirements (uppercase, lowercase, numbers, special characters).
 */
export function generateStrongPassword(length = 16) {
  const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowers = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppers + lowers + numbers + symbols;

  let passwordArray = [
    uppers[Math.floor(Math.random() * uppers.length)],
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  for (let i = passwordArray.length; i < length; i++) {
    passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle array using Fisher-Yates shuffle
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}
