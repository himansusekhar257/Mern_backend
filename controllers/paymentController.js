// const Razorpay = require('razorpay')
// const crypto = require('crypto')
// const subscriptionModel = require('../models/subscription.model')
// const userSubscriptionModel = require('../models/userSubscription.model')

// const razorpay = new Razorpay({
//     key_id:process.env.PAYMENT_KEY,
//     key_secret: process.env.PAYMENT_SECRET_KEY
// })

// const checkout = async (req, res) => {
//     try {
//         const {amount, userId, subscriptionId} = req.body;
//         const options = {
//             amount: amount * 100,
//             currency: "INR",
//             receipt: crypto.randomBytes(16).toString("hex"),
//             payment_capture: 1
//         }
//         const order = await razorpay.orders.create(options)
//         res.json({
//             order_id: order.id,
//             currency: order.currency,
//             amount: order.amount,
//         })
//     } catch (error) {
//         res.status(400).send('Not able to create order. Please try again!');
//     }
 
// }


// const paymentVerification = async (req, res) => {
//     const secret_key = process.env.PAYMENT_SECRET_KEY; // Ensure this is correct

//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
   
   
//     const dataToSign = `${razorpay_order_id}|${razorpay_payment_id}`; // Ensure this format is correct
//     const hmac = crypto.createHmac('sha256', secret_key);
//     hmac.update(dataToSign);
//     const generatedSignature = hmac.digest('hex');

//     console.log('Generated Signature:', generatedSignature); // For debugging
//     console.log('Received Signature:', razorpay_signature); // For debugging

//     if (generatedSignature === razorpay_signature) {
//         console.log('Request is legit');

//         // Process the subscription here

//         const { userId, subscriptionId } = req.body;

//         try {
//             const subscription = await subscriptionModel.findById(subscriptionId);

//             const userSubscription = new userSubscriptionModel({
//                 userId: userId,
//                 subscriptionId: subscriptionId,
//                 razorpayDetails: {
//                     orderId: razorpay_order_id,
//                     paymentId: razorpay_payment_id
//                 },
//                 planDetails: {
//                     plan_name: subscription.name,
//                     plan_price: subscription.amount,
//                     plan_duration: subscription.duration
//                 },
//                 startDate: new Date(),
//                 renewalDate: new Date(new Date().setMonth(new Date().getMonth() + subscription.duration)),
//                 status: 'active'
//             });

//             await userSubscription.save();

//             res.json({
//                 status: 'ok',
//                 message: "Payment verified and subscription created"
//             });
//         } catch (error) {
//             res.status(500).send('Error creating user subscription');
//         }
//     } else {
//         res.status(400).send('Invalid signature');
//     }
// };

// module.exports = {
//     checkout,
//     paymentVerification
// }


const Razorpay = require('razorpay');
const crypto = require('crypto');
const subscriptionModel = require('../models/subscription.model');
const userSubscriptionModel = require('../models/userSubscription.model');

const razorpay = new Razorpay({
    key_id: process.env.PAYMENT_KEY,
    key_secret: process.env.PAYMENT_SECRET_KEY
});

const checkout = async (req, res) => {
    try {
        const { amount, userId, subscriptionId } = req.body;
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(16).toString("hex"),
            payment_capture: 1
        };
        const order = await razorpay.orders.create(options);
        res.json({
            order_id: order.id,
            currency: order.currency,
            amount: order.amount,
        });
    } catch (error) {
        res.status(400).send('Not able to create order. Please try again!');
    }
};

const paymentVerification = async (req, res) => {
    const secret_key = process.env.PAYMENT_SECRET_KEY;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const dataToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const hmac = crypto.createHmac('sha256', secret_key);
    hmac.update(dataToSign);
    const generatedSignature = hmac.digest('hex');

    console.log('Generated Signature:', generatedSignature);
    console.log('Received Signature:', razorpay_signature);

    if (generatedSignature === razorpay_signature) {
        console.log('Request is legit');

        const { userId, subscriptionId } = req.body;

        try {
            const subscription = await subscriptionModel.findById(subscriptionId);

            const startTime = new Date();
            const renewalTime = new Date(startTime.getTime() + subscription.duration * 60000); // Convert minutes to milliseconds

            const userSubscription = new userSubscriptionModel({
                userId: userId,
                subscriptionId: subscriptionId,
                razorpayDetails: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id
                },
                planDetails: {
                    plan_name: subscription.name,
                    plan_price: subscription.amount,
                    plan_duration: subscription.duration
                },
                startTime: startTime,
                renewalTime: renewalTime,
                status: 'active'
            });

            await userSubscription.save();

            res.json({
                status: 'ok',
                message: "Payment verified and subscription created"
            });
        } catch (error) {
            res.status(500).send('Error creating user subscription');
        }
    } else {
        res.status(400).send('Invalid signature');
    }
};

module.exports = {
    checkout,
    paymentVerification
};
