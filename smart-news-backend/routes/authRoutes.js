const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { body, validationResult } = require('express-validator'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

const crypto = require('crypto'); // Untuk generate password acak

router.post('/google', async (req, res) => {
  try {
    const { email, uid, username } = req.body;

    if (!email || !uid || !username) {
      return res.status(400).json({ error: 'Data Google tidak lengkap.' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex'); // generate password acak
      user = new User({
        email,
        username,
        password: randomPassword,
        role: 'user',
      });
      await user.save();
    }

    const token = user.generateAuthToken();
    res.json({
      message: 'Login dengan Google berhasil!',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        token,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login dengan Google.' });
  }
});

// Rute registrasi pengguna
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Username tidak boleh kosong.'),
  body('email').isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }
    user = new User({ username, email, password, role: role || 'user' }); 
    await user.save();
    res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
  } catch (err) {
    logError(err, 'Server error saat register');
    res.status(500).json({ error: 'Terjadi kesalahan server saat registrasi.' });
  }
});

// Rute login pengguna
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email atau kata sandi salah.' });
    }

    const isMatch = await user.comparePassword(password); 
    if (!isMatch) {
      return res.status(400).json({ error: 'Email atau kata sandi salah.' });
    }

    const token = user.generateAuthToken();
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
