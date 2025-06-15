// smart-news-backend/routes/UserRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Pastikan User model diimpor
const auth = require('../middleware/auth'); // Pastikan middleware auth diimpor

// Helper untuk log error
const logError = (err, message) => {
  console.error(`${message}:`, err.message);
};

// --- Rute Pengguna Terproteksi (Membutuhkan Otentikasi) ---

// GET profil pengguna yang sedang login
// Path: /api/users/profile (karena di-use di index.js)
router.get('/profile', auth, async (req, res) => {
  try {
    // req.user._id disediakan oleh middleware 'auth' setelah verifikasi token
    const user = await User.findById(req.user._id).select('-password'); // Jangan kirim password
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
    // req.user._id disediakan oleh middleware 'auth'
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'Profil pengguna tidak ditemukan.' });
    }

    // Perbarui hanya field yang diizinkan (misalnya, username, email, bio, dll.)
    // Pastikan password tidak diupdate langsung di sini tanpa validasi tambahan
    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;
    if (updates.bio) user.bio = updates.bio;
    if (updates.profilePictureUrl) user.profilePictureUrl = updates.profilePictureUrl;
    if (updates.website) user.website = updates.website;
    if (updates.socialMedia) user.socialMedia = updates.socialMedia;

    await user.save(); // Ini akan memicu pre-save hook untuk hashing password jika password diubah
    // Anda mungkin ingin menghapus password dari objek user sebelum mengirimkannya ke frontend
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ message: 'Profil berhasil diperbarui!', user: userResponse });
  } catch (err) {
    logError(err, 'Gagal memperbarui profil pengguna');
    res.status(500).json({ error: 'Terjadi kesalahan server saat memperbarui profil pengguna.' });
  }
});

// Anda dapat menambahkan rute lain yang terkait dengan pengguna di sini,
// seperti GET /api/users/:id (untuk admin), DELETE /api/users/:id (untuk admin), dll.

module.exports = router;
