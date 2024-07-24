const subScriptionModel = require('../../models/subscription.model')

// Create a new subscription
const createSubscription = async (req, res) => {
    try {
        const { name, duration, amount, discountOnMedicines, discountOnDiagnostics, benefits } = req.body;

        // Validate input (you can add more validations as needed)
        if (!name || !duration || !amount || !discountOnMedicines || !discountOnDiagnostics) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Create the subscription
        const newSubscription = new subScriptionModel({
            name,
            duration,
            amount,
            discountOnMedicines,
            discountOnDiagnostics,
            benefits
        });

        // Save the subscription
        await newSubscription.save();

        // Send success response
        res.status(201).json({ success: true, message: 'Subscription created successfully', subscription: newSubscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await subScriptionModel.find();
        res.status(200).json({ success: true, subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single subscription by ID
const getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await subScriptionModel.findById(id);

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        res.status(200).json({ success: true, subscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a subscription
const updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration, amount, discountOnMedicines, discountOnDiagnostics, benefits } = req.body;

        // Validate input (you can add more validations as needed)
        if (!name || !duration || !amount || !discountOnMedicines || !discountOnDiagnostics) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Find the subscription by ID and update it
        const updatedSubscription = await subScriptionModel.findByIdAndUpdate(id, {
            name,
            duration,
            amount,
            discountOnMedicines,
            discountOnDiagnostics,
            benefits
        }, { new: true });

        if (!updatedSubscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        res.status(200).json({ success: true, message: 'Subscription updated successfully', subscription: updatedSubscription });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the subscription by ID and delete it
        const deletedSubscription = await subScriptionModel.findByIdAndDelete(id);

        if (!deletedSubscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found' });
        }

        res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription
};
