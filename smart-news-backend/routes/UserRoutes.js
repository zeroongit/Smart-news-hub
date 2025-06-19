const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const auth = require('../middleware/auth');
const news = require('../models/News');

const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

// --- Rute Pengguna Terproteksi (Membutuhkan Otentikasi) ---

// GET profil pengguna yang sedang login
// Path: /api/users/profile (karena di-use di index.js)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); 
    if (!user) {
      return res.status(404).json({ error: 'Profil pengguna tidak ditemukan.' });
    }
    res.json(user);
  } catch (err) {
    logError(err, 'Gagal mengambil profil pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil profil pengguna.' });
  }
});

// PUT memperbarui profil pengguna yang sedang login
// Path: /api/users/profile (karena di-use di index.js)
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'Profil pengguna tidak ditemukan.' });
    }
    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;
    if (updates.bio) user.bio = updates.bio;
    if (updates.profilePictureUrl) user.profilePictureUrl = updates.profilePictureUrl;
    if (updates.website) user.website = updates.website;
    if (updates.socialMedia) user.socialMedia = updates.socialMedia;

    await user.save(); 
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Profil berhasil diperbarui!', user: userResponse });
  } catch (err) {
    logError(err, 'Gagal memperbarui profil pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat memperbarui profil pengguna.' });
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
