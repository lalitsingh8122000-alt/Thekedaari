/**
 * Log full error server-side; optional `detail` in JSON when not production
 * (helps debug Prisma "Unknown column" / missing migration issues).
 */
function isDatabaseUnavailableError(err) {
  if (!err) return false;
  const name = err.constructor?.name || err.name || '';
  const msg = String(err.message || '');
  const code = err.code || err.errorCode;
  return (
    name === 'PrismaClientInitializationError' ||
    code === 'P1001' ||
    code === 'P1017' ||
    /Can't reach database server/i.test(msg) ||
    /Server has closed the connection/i.test(msg) ||
    /ECONNREFUSED/i.test(msg)
  );
}

function sendServerError(res, err, label) {
  if (label) console.error(`[${label}]`, err);
  else console.error(err);
  const body = { error: 'Server error' };
  if (process.env.NODE_ENV !== 'production' && err && err.message) {
    body.detail = err.message;
  }
  res.status(500).json(body);
}

/** Use in route catch blocks: returns 503 when MySQL/Prisma cannot connect. */
function sendRouteError(res, err, label) {
  if (isDatabaseUnavailableError(err)) {
    if (label) console.error(`[${label}]`, err);
    else console.error(err);
    return res.status(503).json({
      error: 'Database unavailable',
      message:
        'Cannot connect to MySQL. Start the database (e.g. brew services start mysql or docker compose up) and check DATABASE_URL.',
    });
  }
  return sendServerError(res, err, label);
}

module.exports = { sendServerError, sendRouteError, isDatabaseUnavailableError };
