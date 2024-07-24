const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    razorpayDetails: {
        orderId: {
            type: String,
            required: true
        },
        paymentId: {
            type: String,
            required: true
        }
    },
    planDetails: {
        plan_name: {
            type: String,
            required: true
        },
        plan_price: {
            type: Number,
            required: true
        },
        plan_duration: {
            type: Number,
            required: true
        }
    },
    startTime: {
        type: Date,
        required: true
    },
    renewalTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'canceled'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);
