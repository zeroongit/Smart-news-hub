// smart-news-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Pastikan User model diimpor
const { body, validationResult } = require('express-validator'); // Untuk validasi
const jwt = require('jsonwebtoken'); // Untuk JWT
const bcrypt = require('bcryptjs'); // Atau bcrypt, tergantung yang Anda pakai

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

// Rute registrasi pengguna
// Path: /api/auth/register (karena di-use di index.js)
router.post('/register', [
  // Validasi input
  body('username').trim().notEmpty().withMessage('Username tidak boleh kosong.'),
  body('email').isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.')
], async (req, res) => {
  // Cek hasil validasi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role } = req.body;

    // Cek apakah email sudah terdaftar
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    // Buat user baru
    user = new User({ username, email, password, role: role || 'user' }); // Default role 'user'

    // Hash password akan dilakukan di pre-save hook di User model, jika ada
    await user.save();

    // Opsional: Langsung berikan token setelah registrasi sukses
    // const token = user.generateAuthToken(); // Asumsi ada method ini di User model
    // res.status(201).json({ message: 'Registrasi berhasil!', token });

    res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });

  } catch (err) {
    logError(err, 'Server error saat register');
    // Berikan pesan error yang lebih spesifik jika memungkinkan
    res.status(500).json({ error: 'Terjadi kesalahan server saat registrasi.' });
  }
});

// Rute login pengguna
// Path: /api/auth/login (karena di-use di index.js)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email atau kata sandi salah.' });
    }

    const isMatch = await user.comparePassword(password); // Asumsi ada method ini di User model
    if (!isMatch) {
      return res.status(400).json({ error: 'Email atau kata sandi salah.' });
    }

    const token = user.generateAuthToken(); // Asumsi ada method ini di User model
    res.json({
  message: 'Login berhasil!',
  user: {
    _id: user._id,
    username: user.username,
    role: user.role,
    token: token
  }
});

  } catch (err) {
    logError(err, 'Gagal login pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat login.' });
  }
});

module.exports = router;
