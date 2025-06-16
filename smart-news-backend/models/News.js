// smart-news-backend/models/News.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify'); // Impor slugify

const newsSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4
  },
  user_id: {
    type: String,
    required: true
  },
  judul: {
    type: String,
    required: true
  },
  penulis: {
    type: String,
    required: true
  },
  kategori: {
    type: String,
    default: 'Umum'
  },
  status: {
    type: String,
    enum: ['Public', 'Draft', 'Pending', 'ReviewDelete'], // Tambahkan 'ReviewDelete'
    default: 'Pending'
  },
  deskripsi: {
    type: String,
    required: true
  },
  gambar: {
    type: String, // Nama file atau ID unik Google Drive/cloud/local file
    required: true
  },
  slug: {
    type: String,
    unique: true,
    index: true // Menambahkan indeks untuk slug
  },
  visitor_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook untuk menghasilkan slug
newsSchema.pre('save', async function (next) {
  if (this.isModified('judul')) { // Hanya generate slug jika judul dimodifikasi
    let newSlug = slugify(this.judul, { lower: true, strict: true });
    
    // Pastikan slug unik
    let counter = 1;
    let originalSlug = newSlug;
    while (await this.constructor.findOne({ slug: newSlug })) {
      newSlug = `${originalSlug}-${counter}`;
      counter++;
    }
    this.slug = newSlug;
  }
  this.updated_at = Date.now(); // Perbarui updated_at setiap kali dokumen disimpan
  next();
});

// Anda mungkin perlu menambahkan index ke skema News jika belum ada
// newsSchema.index({ slug: 1 }, { unique: true }); // Pastikan indeks slug_1 ini ada

module.exports = mongoose.model('News', newsSchema);
