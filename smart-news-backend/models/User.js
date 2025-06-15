// smart-news-backend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Menggunakan bcryptjs (lebih disarankan untuk Vercel Serverless)
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  profilePictureUrl: {
    type: String,
    default: null
  },
  website: {
    type: String,
    trim: true
  },
  socialMedia: {
    instagram: String,
    linkedin: String
  }
}, { timestamps: true });

// --- Pre-save hook untuk hash password sebelum disimpan ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --- Method untuk membandingkan password (digunakan saat login) ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw new Error('Gagal membandingkan password.');
  }
};

// --- Method untuk membuat token JWT ---
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role, username: this.name }, // Payload token
    process.env.JWT_SECRET, // Menggunakan JWT_SECRET dari environment variables
    { expiresIn: '1h' } // Token berlaku 1 jam
  );
  return token;
};

module.exports = mongoose.model('User', userSchema);
