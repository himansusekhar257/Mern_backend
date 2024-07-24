const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        // required: true
        // Add any validation or additional settings as needed
    },
    password: {
        type: String
        // Ensure password hashing is handled in your controller logic
    },
    profilePicture: {
        type: String // Store the URL of the profile picture in AWS S3
    },

    role: {
        type: Number,
        default: 0
    }
    // You can add more fields as needed
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const User = mongoose.model('User', userSchema);

module.exports = User;
