const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
require('./config/googleStetegy')
dotenv.config();

const userRoutes = require('./routes/userRoutes');
const passport = require('passport');

const app = express();
app.use(helmet()); // Set security-related HTTP headers

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000', // replace with your frontend domain
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xssClean());

// Prevent HTTP parameter pollution
app.use(hpp());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGOOSE_URL = process.env.MONGOOSE_URL || "mongodb://127.0.0.1:27017/nodepractice";

mongoose.connect(MONGOOSE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

app.use('/api/users', userRoutes);

app.get('/auth/google', passport.authenticate('google', { session: false, scope: ['profile'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/account/login' }),
(req, res) => {
    //Sucessfull authentication ,redirect home.
    const {user, accessToken, refreshToken}  = req.user;
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,  
        secure: false, 
        sameSite: 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    res.redirect('http://localhost:3000');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
