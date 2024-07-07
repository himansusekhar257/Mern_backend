const jwt = require('jsonwebtoken');
const config = require('config');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, config.get('JWT_SECRET'));
        req.user = payload;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
