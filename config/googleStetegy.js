// const GoogleStrategy = require('passport-google-oauth20')
// const passport = require('passport')
// const User = require('../models/userModel')
// const {generateTokens} = require('../controllers/userController')
// const dotenv = require('dotenv');
// const bcryptjs = require('bcryptjs');
// dotenv.config();

// console.log(process.env.GOOGLE_CLIENT_ID);
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//  async (accessToken, refreshToken, profile, done) => {
//     console.log("profile",profile);
//         try {
//             //check if user already exists in the database
//             let user = await User.findOne({email: profile._json.email});

//             if(!user){
//                 const lastSixDigitsID = profile.id.substring(profile.id.length - 6);
//                 const lastTwoDigitsName = profile._json.name.substring(profile._json.name.length - 2);
//                 const newPass = lastTwoDigitsName + lastSixDigitsID;
//                 const hashedPassword = await bcryptjs.hash(newPass, 12);
//                 await User.create({
//                     name: profile._json.name,
//                     email: profile._json.email,
//                     is_verified: true,
//                     password: hashedPassword,
//                 })
//             }

//             //Generate Tokens
//             const {accessToken, refreshToken} = await generateTokens(uesr);
//             return done(null, {user, accessToken, refreshToken});

//         } catch (error) {
//             return done(error)
//         }
//   }
// ));

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/userModel');
const { generateTokens } = require('../controllers/userController');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log("Full Profile:", profile);
    try {
      const email = profile.emails ? profile.emails[0].value : null;

      if (!email) {
        return done(new Error('Email is not available from Google profile'));
      }

      let user = await User.findOne({ email });

      if (!user) {
        const lastSixDigitsID = profile.id.substring(profile.id.length - 6);
        const lastTwoDigitsName = profile.name.givenName.substring(profile.name.givenName.length - 2);
        const newPass = lastTwoDigitsName + lastSixDigitsID;
        const hashedPassword = await bcryptjs.hash(newPass, 12);
        user = await User.create({
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email,
          password: hashedPassword,
          profilePicture: profile.photos[0].value,
        });
      }

      const { accessToken, refreshToken } = await generateTokens(user);
      return done(null, { user, accessToken, refreshToken });

    } catch (error) {
      return done(error);
    }
  }
));

module.exports = passport;
