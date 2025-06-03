const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);
