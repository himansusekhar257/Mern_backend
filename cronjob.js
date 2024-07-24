// const cron = require('node-cron');
// const nodemailer = require('nodemailer');
// const moment = require('moment');
// const userSubscriptionModel = require('./models/userSubscription.model');

// // Set up Nodemailer
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

// // Schedule the job to run daily at midnight
// cron.schedule('0 0 * * *', async () => {
//     try {
//         const expiringSubscriptions = await userSubscriptionModel.find({
//             status: 'active',
//             renewalDate: { 
//                 $gte: moment().add(4, 'days').startOf('day').toDate(),
//                 $lt: moment().add(4, 'days').endOf('day').toDate()
//             }
//         }).populate('userId');

//         expiringSubscriptions.forEach(subscription => {
//             const mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to: subscription.userId.email,
//                 subject: 'Subscription Expiry Alert',
//                 text: `Dear ${subscription.userId.firstName}, your subscription is about to expire on ${moment(subscription.renewalDate).format('YYYY-MM-DD')}. Please renew your subscription to continue enjoying the benefits.`
//             };

//             transporter.sendMail(mailOptions, (error, info) => {
//                 if (error) {
//                     console.error('Error sending email:', error);
//                 } else {
//                     console.log('Email sent:', info.response);
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('Error in cron job:', error);
//     }
// });


const cron = require('node-cron');
const nodemailer = require('nodemailer');
const moment = require('moment');
const userSubscriptionModel = require('./models/userSubscription.model');

// Set up Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Schedule the job to run every minute
cron.schedule('* * * * *', async () => {
    try {
        const now = moment();
        const expiringSubscriptions = await userSubscriptionModel.find({
            status: 'active',
            renewalTime: { 
                $gte: now.toDate(),
                $lt: now.add(1, 'minute').toDate()
            }
        }).populate('userId');

        expiringSubscriptions.forEach(subscription => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: subscription.userId.email,
                subject: 'Subscription Expiry Alert',
                text: `Dear ${subscription.userId.firstName}, your subscription is about to expire on ${moment(subscription.renewalTime).format('YYYY-MM-DD HH:mm:ss')}. Please renew your subscription to continue enjoying the benefits.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        });
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});
