const PROVISIONAL_END_YEARS = 25;

/** When the user does not set an end date, store a far-future date so NOT NULL columns still work. */
function provisionalExpectedEnd(startDate) {
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) {
    const f = new Date();
    f.setUTCFullYear(f.getUTCFullYear() + PROVISIONAL_END_YEARS);
    return f;
  }
  const out = new Date(d);
  out.setUTCFullYear(out.getUTCFullYear() + PROVISIONAL_END_YEARS);
  return out;
}

module.exports = { provisionalExpectedEnd, PROVISIONAL_END_YEARS };
