const PHONE_REGEX = /^\d{10}$/;
const VALID_WORKER_STATUS = new Set(['Active', 'Inactive']);
const VALID_PROJECT_TYPES = new Set(['Small', 'Medium', 'Big']);
const VALID_PROJECT_STATUS = new Set(['Running', 'Completed']);
const VALID_ATTENDANCE_TYPES = new Set(['FullDay', 'HalfDay', 'Other', 'Absent']);
const VALID_PAYMENT_MODES = new Set(['Cash', 'Online']);
const VALID_LEDGER_TYPES = new Set(['Credit', 'Debit']);
const VALID_LEDGER_CATEGORIES = new Set(['Salary', 'Bonus', 'Payment', 'Other']);
const VALID_EXPENSE_REMARKS = new Set(['Cement', 'Sand', 'Labour', 'Others']);

function normalizeString(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}

function isValidPhone(value) {
  return PHONE_REGEX.test(value);
}

function parseAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.round(num * 100) / 100;
}

function parseId(value) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

module.exports = {
  VALID_WORKER_STATUS,
  VALID_PROJECT_TYPES,
  VALID_PROJECT_STATUS,
  VALID_ATTENDANCE_TYPES,
  VALID_PAYMENT_MODES,
  VALID_LEDGER_TYPES,
  VALID_LEDGER_CATEGORIES,
  VALID_EXPENSE_REMARKS,
  normalizeString,
  normalizePhone,
  isValidPhone,
  parseAmount,
  parseId,
  isValidDate,
};
