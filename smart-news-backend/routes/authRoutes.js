const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { body, validationResult } = require('express-validator'); 
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcryptjs'); 

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

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

router.delete('/delete', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    await News.deleteMany({ user_id: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Akun dan semua berita Anda telah dihapus.' });
  } catch (err) {
    console.error('Gagal menghapus akun:', err.message);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghapus akun.' });
  }
});

module.exports = router;
