// smart-news-backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2; // Pastikan Cloudinary diimpor
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Jika menggunakan ini
const auth = require('../middleware/auth'); // Jika upload butuh otentikasi
 


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'smart-news-uploads', 
    format: async (req, file) => 'png', 
    public_id: (req, file) => file.originalname, 
  },
});

const parser = multer({ storage: storage });

router.post('/image', auth, parser.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah.' });
    }

    res.status(200).json({
      message: 'Gambar berhasil diunggah!',
      imageUrl: req.file.path,
      publicId: req.file.filename 
    });
  } catch (err) {
    console.error('Error uploading image to Cloudinary:', err);
    res.status(500).json({ error: 'Gagal mengunggah gambar ke Cloudinary.' });
  }
});

module.exports = router;