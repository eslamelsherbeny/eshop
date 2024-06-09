const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserOtpVerificationSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

const UserOtpVerification = mongoose.model('UserOtpVerification', UserOtpVerificationSchema);
module.exports = UserOtpVerification;
