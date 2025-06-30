function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (/^\$/.test(key) || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]); 
      }
    }
  }
}

function mongoSanitize(req, res, next) {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
}

module.exports = { mongoSanitize };
