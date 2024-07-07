const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/userModel');
const config = require('config');
const { validationResult } = require('express-validator');

// Google OAuth function
const handleGoogleSignup = async (googleAccessToken) => {
    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${googleAccessToken}`
            }
        });

        const { given_name: firstName, family_name: lastName, email, picture: profilePicture } = response.data;

        const alreadyExistUser = await User.findOne({ email });
        if (alreadyExistUser) {
            throw new Error('User already exists');
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            profilePicture
        });

        await newUser.save();
        return newUser;
    } catch (error) {
        throw new Error('Google OAuth signup failed');
    }
};

// Helper function to generate tokens
const generateTokens = (user) => {
    const accessToken = jwt.sign({
        email: user.email,
        id: user._id,
    }, config.get('JWT_SECRET'), { expiresIn: '15m' });

    const refreshToken = jwt.sign({
        email: user.email,
        id: user._id,
    }, config.get('REFRESH_TOKEN_SECRET'), { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

// Signup controller
const signupController = async (req, res) => {
    try {
        if (req.body.googleAccessToken) {
            // Handle Google OAuth signup
            const newUser = await handleGoogleSignup(req.body.googleAccessToken);

            const { accessToken, refreshToken } = generateTokens(newUser);

            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,  //This flag ensures that the cookie is not accessible via JavaScript (document.cookie), which helps protect against cross-site scripting (XSS) attacks.
                secure: false, // Ensure secure is false for development/ secure: process.env.NODE_ENV === 'production': This flag ensures that the cookie is only sent over HTTPS connections. It is set to true when the application is running in a production environment.
                sameSite: 'lax', // Set SameSite to lax for development and sameSite: 'strict' use for ensure the cookie is only sent with requests originating from same site
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days // it's the expire
            });

            res.status(200).json({ result: newUser, accessToken });
        } else {
            // Handle regular signup with email/password and uploaded file
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { firstName, lastName, phoneNumber, email, password, confirmPassword } = req.body;
            const profilePicture = req.file; // Contains S3 object details

            // Basic validation
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'Passwords do not match' });
            }

            const alreadyExistUser = await User.findOne({ email });
            if (alreadyExistUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashPassword = await bcrypt.hash(password, 12);

            const newUser = new User({
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashPassword,
                profilePicture: profilePicture ? profilePicture.location : null, // Save S3 URL to profilePicture field if file uploaded
            });

            await newUser.save();

            const { accessToken, refreshToken } = generateTokens(newUser);

            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,  //This flag ensures that the cookie is not accessible via JavaScript (document.cookie), which helps protect against cross-site scripting (XSS) attacks.
            secure: false, // Ensure secure is false for development/ secure: process.env.NODE_ENV === 'production': This flag ensures that the cookie is only sent over HTTPS connections. It is set to true when the application is running in a production environment.
            sameSite: 'lax', // Set SameSite to lax for development and sameSite: 'strict' use for ensure the cookie is only sent with requests originating from same site
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days // it's the expire
            });

            res.status(201).json({ result: newUser, accessToken }); // Changed to 201 Created
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Signin controller
const signinController = async (req, res) => {
    try {
        if (req.body.googleAccessToken) {
            // Handle Google OAuth signin
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${req.body.googleAccessToken}`
                }
            });

            const email = response.data.email;
            const alreadyExistUser = await User.findOne({ email });
            if (!alreadyExistUser) {
                return res.status(400).json({ message: "User doesn't exist" });
            }

            const { accessToken, refreshToken } = generateTokens(alreadyExistUser);

            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,  //This flag ensures that the cookie is not accessible via JavaScript (document.cookie), which helps protect against cross-site scripting (XSS) attacks.
                secure: false, // Ensure secure is false for development/ secure: process.env.NODE_ENV === 'production': This flag ensures that the cookie is only sent over HTTPS connections. It is set to true when the application is running in a production environment.
                sameSite: 'lax', // Set SameSite to lax for development and sameSite: 'strict' use for ensure the cookie is only sent with requests originating from same site
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days // it's the expire
            });

            res.status(200).json({ result: alreadyExistUser, accessToken });
        } else {
            // Handle regular signin with email/password
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            const alreadyExistUser = await User.findOne({ email });
            if (!alreadyExistUser) {
                return res.status(400).json({ message: "User doesn't exist" });
            }

            const isPasswordCorrect = await bcrypt.compare(password, alreadyExistUser.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const { accessToken, refreshToken } = generateTokens(alreadyExistUser);

            res.setHeader('Authorization', `Bearer ${accessToken}`);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,  //This flag ensures that the cookie is not accessible via JavaScript (document.cookie), which helps protect against cross-site scripting (XSS) attacks.
            secure: false, // Ensure secure is false for development/ secure: process.env.NODE_ENV === 'production': This flag ensures that the cookie is only sent over HTTPS connections. It is set to true when the application is running in a production environment.
            sameSite: 'lax', // Set SameSite to lax for development and sameSite: 'strict' use for ensure the cookie is only sent with requests originating from same site
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days // it's the expire
            });

            res.status(200).json({ result: alreadyExistUser, accessToken });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Refresh token endpoint
const refreshTokenController = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const payload = jwt.verify(refreshToken, config.get('REFRESH_TOKEN_SECRET'));

        const newAccessToken = jwt.sign(
            { email: payload.email, id: payload.id },
            config.get('JWT_SECRET'),
            { expiresIn: '15m' }
        );

        const newRefreshToken = jwt.sign(
            { email: payload.email, id: payload.id },
            config.get('REFRESH_TOKEN_SECRET'),
            { expiresIn: '7d' }
        );

        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,  //This flag ensures that the cookie is not accessible via JavaScript (document.cookie), which helps protect against cross-site scripting (XSS) attacks.
            secure: false, // Ensure secure is false for development/ secure: process.env.NODE_ENV === 'production': This flag ensures that the cookie is only sent over HTTPS connections. It is set to true when the application is running in a production environment.
            sameSite: 'lax', // Set SameSite to lax for development and sameSite: 'strict' use for ensure the cookie is only sent with requests originating from same site
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days // it's the expire
        });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};

module.exports = {
    signinController,
    signupController,
    refreshTokenController,
    generateTokens
};
