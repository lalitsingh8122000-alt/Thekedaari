/**
 * Log full error server-side; optional `detail` in JSON when not production
 * (helps debug Prisma "Unknown column" / missing migration issues).
 */
function sendServerError(res, err, label) {
  if (label) console.error(`[${label}]`, err);
  else console.error(err);
  const body = { error: 'Server error' };
  if (process.env.NODE_ENV !== 'production' && err && err.message) {
    body.detail = err.message;
  }
  res.status(500).json(body);
}

module.exports = { sendServerError };
