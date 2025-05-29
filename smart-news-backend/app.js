// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const newsRoutes = require('./routes/newsRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');


app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);


module.exports = app;
