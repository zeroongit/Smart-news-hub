const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; 
  if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ada.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};
