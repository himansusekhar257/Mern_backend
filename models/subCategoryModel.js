const mongoose = require('mongoose')


const SubCategotySchema = new mongoose.Schema({
    subcategory_name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Subcategory', SubCategotySchema)