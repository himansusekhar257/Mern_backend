const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true
    },

    subCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
    }]

})

module.exports = mongoose.model('Category', categorySchema);