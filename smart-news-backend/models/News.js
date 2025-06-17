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
  kategori: { // Ini adalah properti yang akan menyimpan slug kategori
    type: String,
    default: 'umum' // Default slugified category
  },
  kategori_nama: { // Ini adalah properti untuk menyimpan nama kategori asli (misal: "Ekonomi & Bisnis")
    type: String,
    default: 'Umum'
  },
  status: {
    type: String,
    enum: ['Public', 'Draft', 'Pending', 'ReviewDelete'],
    default: 'Pending'
  },
  deskripsi: {
    type: String,
    required: true
  },
  gambar: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true,
    index: true
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

// Pre-save hook untuk menghasilkan slug judul dan slug kategori
newsSchema.pre('save', async function (next) {
  // Slug untuk judul (harus konsisten juga jika digunakan di URL)
  if (this.isModified('judul')) {
    let cleanJudul = this.judul
      .toLowerCase()
      .replace(/&/g, 'and') // Ganti '&' dengan 'and'
      .replace(/\s+/g, '-') // Ganti spasi dengan strip
      .replace(/[^a-z0-9-]/g, '') // Hapus karakter non-alphanumeric kecuali strip
      .replace(/--+/g, '-') // Hilangkan strip ganda
      .replace(/^-+|-+$/g, ''); // Hilangkan strip di awal atau akhir

    let newSlug = cleanJudul;
    
    let counter = 1;
    let originalSlug = newSlug;
    while (await this.constructor.findOne({ slug: newSlug })) {
      newSlug = `${originalSlug}-${counter}`;
      counter++;
    }
    this.slug = newSlug;
  }

  // Standardisasi slugifikasi untuk kategori juga
  if (this.isModified('kategori')) {
    this.kategori_nama = this.kategori; // Simpan nama asli kategori sebelum di-slug
    this.kategori = this.kategori
      .toLowerCase()
      .replace(/&/g, 'and') // Ganti '&' dengan 'and' (PENTING: konsisten dengan frontend)
      .replace(/\s+/g, '-') // Ganti spasi dengan strip
      .replace(/[^a-z0-9-]/g, '') // Hapus karakter non-alphanumeric kecuali strip
      .replace(/--+/g, '-') // Hilangkan strip ganda
      .replace(/^-+|-+$/g, ''); // Hilangkan strip di awal atau akhir
  }

  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('News', newsSchema);
