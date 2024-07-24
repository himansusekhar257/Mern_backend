const express = require('express')
const { createSubscription, getAllSubscriptions, updateSubscription, deleteSubscription } = require('../../controllers/subscription/subscriptionController')
const { isAdmin, authMiddleware } = require('../../middlewares/authMiddleWare')
const router = express()

router.post('/add-subscription', authMiddleware, isAdmin, createSubscription)
router.get('/get-subscription', authMiddleware, getAllSubscriptions)
router.patch('/edit-subscription', authMiddleware, isAdmin, updateSubscription)
router.delete('/delete-subscription', authMiddleware, isAdmin, deleteSubscription)

module.exports = router