const mongoose = require('mongoose')
const requestSchema = new mongoose.Schema({
    reason: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Accepted', 'Refused'],
        default: 'Pending'
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
})
const Request = mongoose.model('Request', requestSchema)
module.exports = Request