const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/userModel');

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

const isAdmin = async (req, res, next) => {
    try {
        const adminDetails = await User.findById(req.user.id);
        if (!adminDetails) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (adminDetails.role === 1) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {authMiddleware, isAdmin};
