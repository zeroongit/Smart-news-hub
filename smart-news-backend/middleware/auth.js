const jwt = require('jsonwebtoken');
const SECRET = "s3cr3tJWTkey123";

function auth(req, res, next) {
    const token = req.headers.authorization?.split('')[1];
    if (!token) return res.status(401).json({ message: "No token provided"});

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        nexxt();
    } catch (err) {
        res.status(403).json({ message: "Invalid token"});
    }
}

module.exports = auth;