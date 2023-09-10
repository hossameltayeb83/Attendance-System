const mongoose = require('mongoose')
const logSchema = new mongoose.Schema({
    time:{
        type:Date,
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:['checkIn','checkOut']
    },
    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Employee'
        }
})
const Log = mongoose.model('Log',logSchema)
module.exports = Log