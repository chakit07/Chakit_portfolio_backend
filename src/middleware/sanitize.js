/**
 * Recursive sanitizer to prevent MongoDB operator injection ($gt, $where, etc.)
 */
const cleanObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys that begin with '$' or contain '.' which are used in MongoDB query injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanObject(value);
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  next();
};

module.exports = { sanitizeInput };
