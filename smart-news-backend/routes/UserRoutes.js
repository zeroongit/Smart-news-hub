const express = require('express');
const router = express.Router();
const user = require('../models/User');
const auth = require('../middleware/auth');
const User = require('../models/User');

const logError = (err, message) => {
    console.error(`${message}:`, err.message);

};

router.get('/profile', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Profil pengguna tidak ditemukan.'});
        }
        res.json(user);
    } catch (err) {
        logError(err, 'Gagal mengambil profil pengguna');
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil profil.'});
    }
});

router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email, oldPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Profil pengguna tidak ditemukan.'});
        }

        if (name) user.name = name;
        if (email) user.email = email;

        if (oldPassword && newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.newPassword);
            if (!isMatch) {
                return res.status(400).json({ error: 'Password lama salah.'});
            }
            const hashedNewsPassword = hashedNewsPassword;
        } else if (oldPassword && !newPassword) {
            return res.status(400).json({ error: 'Password baru harus disediakan jika password lama diisi'});        
        } else if (!oldPassword && newPassword) {
            return res.status(400).json ({ error: 'Password lama harus disediakan untuk mengubah password.'});
        }

        await user.save();

        const updateUser = await User.findById(userId).select('-password');
        res.json({ message: 'Profil berhasil diupdate.', user: updateUser });
    } catch (err) {
        logError(err, 'Gagal mengupdate profil pengguna');

        if ( err.code === 11000) {
            return res.status(400).json({ error: 'Email sudah terdaftar. Mohon gunakan email lain.'});
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengupdate profil.'});
    }
});

router.delete('/profile', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'Profil pengguna tidak ditemukan'});
        }
        res.json({ message: 'Profil berhasil dihapus.'});
    } catch (err) {
        logError(err, 'Gagal menghapus profil pengguna');
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengahpus profil.'});
    }
});

module.exports = router;