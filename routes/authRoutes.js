const express = require('express');
const { signinController, signupController, refreshTokenController, getUser, getUserById } = require('../controllers/userController');
const { upload } = require('../middlewares/uploadMiddleware'); // Import the upload middleware
const resizeAndUpload = require('../middlewares/resizeUpload'); // Import the resizeAndUpload middleware
const { validateSignup, validateSignin } = require('../helper/authValidator');
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleWare');
const router = express.Router();

router.post('/signin', validateSignin, signinController);
// router.post('/signup', upload.single('profilePicture'), resizeAndUpload, signupController); //currently don't have the bucket
router.post('/signup', validateSignup, signupController);
router.post('/refresh-token', refreshTokenController)
router.get('/allUsers',authMiddleware,getUser)
router.get('/profile',authMiddleware,getUserById)

module.exports = router;
