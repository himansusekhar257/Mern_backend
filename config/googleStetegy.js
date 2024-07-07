const GoogleStrategy = require('passport-google-oauth20')
const passport = require('passport')
const User = require('../models/userModel')
const {generateTokens} = require('../controllers/userController')
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
 async (accessToken, refreshToken, profile, done) => {
    console.log("profile",profile);
        try {
            //check if user already exists in the database
            let user = await User.findOne({email: profile._json.email});

            if(!user){
                const lastSixDigitsID = profile.id.substring(profile.id.length - 6);
                const lastTwoDigitsName = profile._json.name.substring(profile._json.name.length - 2);
                const newPass = lastTwoDigitsName + lastSixDigitsID;
                const hashedPassword = await bcrypt.hash(newPass, 12);
                await User.create({
                    name: profile._json.name,
                    email: profile._json.email,
                    is_verified: true,
                    password: hashedPassword,
                })
            }

            //Generate Tokens
            const {accessToken, refreshToken} = await generateTokens(uesr);
            return done(null, {user, accessToken, refreshToken});

        } catch (error) {
            return done(error)
        }
  }
));