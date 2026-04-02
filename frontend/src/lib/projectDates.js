const PROVISIONAL_END_YEARS = 25;

export function provisionalExpectedEnd(startInput) {
  const d = new Date(startInput);
  if (Number.isNaN(d.getTime())) {
    const f = new Date();
    f.setUTCFullYear(f.getUTCFullYear() + PROVISIONAL_END_YEARS);
    return f;
  }
  const out = new Date(d);
  out.setUTCFullYear(out.getUTCFullYear() + PROVISIONAL_END_YEARS);
  return out;
}

/** True if stored end date matches the backend’s “no end date yet” placeholder (start + 25y). */
export function isProvisionalExpectedEnd(startInput, endInput) {
  if (!startInput || !endInput) return false;
  const p = provisionalExpectedEnd(startInput).getTime();
  const e = new Date(endInput).getTime();
  return Math.abs(e - p) < 86400000; /* within 1 day for TZ drift */
}
