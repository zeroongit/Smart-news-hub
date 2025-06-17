// smart-news-backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const auth = require('../middleware/auth'); // Jika upload butuh otentikasi

// Simpan file sementara
const upload = multer({ dest: 'temp_uploads/' });

const IMAGEKIT_PUBLIC_API_KEY = process.env.IMAGEKIT_PUBLIC_API_KEY;
const IMAGEKIT_UPLOAD_ENDPOINT = process.env.IMAGEKIT_URL || 'https://upload.imagekit.io/api/v1/files/upload';


router.post('/image', auth, upload.single('image'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah.' });
  }

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(file.path));
    form.append('fileName', file.originalname);

    const response = await axios.post(IMAGEKIT_UPLOAD_ENDPOINT, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: 'Basic ' + Buffer.from(IMAGEKIT_PUBLIC_API_KEY + ':').toString('base64')
      }
    });

    fs.unlinkSync(file.path); // Hapus file lokal setelah upload

    res.status(200).json({
      message: 'Gambar berhasil diunggah ke ImageKit!',
      imageUrl: response.data.url,
      fileId: response.data.fileId,
    });
  } catch (err) {
    console.error('Error uploading to ImageKit:', err.message);
    res.status(500).json({ error: 'Gagal mengunggah gambar ke ImageKit.' });
  }
});

module.exports = router;
