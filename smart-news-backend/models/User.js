const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
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
    console.error('Error hashing password:', err); 
    next(err);
  }
});

// --- Method untuk membandingkan password (digunakan saat login) ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Error comparing password:', err); 
    throw new Error('Gagal membandingkan password.');
  }
};

// --- Method untuk membuat token JWT ---
userSchema.methods.generateAuthToken = function () {
  console.log('Attempting to generate JWT token...');
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET); 
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is NOT defined in environment variables!');
    throw new Error('JWT_SECRET is not configured on the server.');
  }

  const token = jwt.sign(
    { _id: this._id, role: this.role, username: this.username }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' } 
  );
  console.log('JWT token generated successfully.');
  return token;
};

module.exports = mongoose.model('User', userSchema);
