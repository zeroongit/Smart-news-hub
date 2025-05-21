const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../models/User');

const router = express.Router();
const SECRET = 's3cr3tJWTkey123';

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const userExists = users.find(u => u.username === username);
    if (userExists) return res.status(400).json({ message: 'User already exists'})
    
    const hashed = await bcrypt.hash(password, 10);
    users.push({ username, password: hashed});
    res.status(201).json({ message: 'User registered'});
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(400).json({ message: 'User not found'});

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials"});

    const token = jwt.sign({ username }, SECRET, { expiresIn: "1h"});
    res.json({ token });
});

module.exports = router;