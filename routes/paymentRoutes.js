const express = require('express');
const { checkout, paymentVerification } = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', checkout);
router.post('/verify-payment', paymentVerification);

module.exports = router;