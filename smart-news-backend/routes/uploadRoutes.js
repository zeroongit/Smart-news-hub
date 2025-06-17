const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', auth, upload.single('image'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah.' });
  }

  try {
    const form = new FormData();
    form.append('file', file.buffer, file.originalname);
    form.append('fileName', file.originalname);

    const response = await axios.post(
      process.env.IMAGEKIT_URL || 'https://upload.imagekit.io/api/v1/files/upload',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: 'Basic ' + Buffer.from(process.env.IMAGEKIT_PRIVATE_API_KEY + ':').toString('base64')
        }
      }
    );

    res.status(200).json({
      message: 'Gambar berhasil diunggah ke ImageKit!',
      imageUrl: response.data.url,
      fileId: response.data.fileId,
    });
  } catch (err) {
    console.error('Upload ke ImageKit gagal:', err);
res.status(500).json({ error: err.response?.data || err.message || 'Upload gagal' });
  }
});

module.exports = router;
