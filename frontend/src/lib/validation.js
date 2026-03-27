export const PHONE_LENGTH = 10;

export function normalizeText(value) {
  return String(value ?? '').trim();
}

export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}

export function isValidPhone(value) {
  return /^\d{10}$/.test(value);
}

export function sanitizePhoneInput(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, PHONE_LENGTH);
}

export function parsePositiveAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}

export function isValidDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value ?? ''))) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
