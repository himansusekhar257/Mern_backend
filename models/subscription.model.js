const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                if ((this.amount === 119 && value === 3) ||
                    (this.amount === 239 && value === 6) ||
                    (this.amount === 479 && value === 12)) {
                    return true;
                }
                return false;
            },
            message: props => `Duration ${props.value} does not match the amount ${props.instance.amount}`
        }
    },
    amount: {
        type: Number,
        required: true,
        enum: [119, 239, 479]
    },
    discountOnMedicines: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                if ((this.amount === 119 && value === 3) ||
                    (this.amount === 239 && value === 5) ||
                    (this.amount === 479 && value === 7)) {
                    return true;
                }
                return false;
            },
            message: props => `Discount on medicines ${props.value} does not match the amount ${props.instance.amount}`
        }
    },
    discountOnDiagnostics: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                if ((this.amount === 119 && value === 3) ||
                    (this.amount === 239 && value === 5) ||
                    (this.amount === 479 && value === 7)) {
                    return true;
                }
                return false;
            },
            message: props => `Discount on diagnostics ${props.value} does not match the amount ${props.instance.amount}`
        }
    },
    benefits: {
        type: [String],
        required: true,
        default: ["Free delivery on any deliverable purchases", "Virtual Doctor consult overly health checkup"]
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
