const mongoose = require('mongoose')
const departmentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    startOfDay:{
        type:String,
        required:true
    },
    endOfDay:{
        type:String,
        required:true
    }
    
})
const Department = mongoose.model('Department',departmentSchema)
module.exports = Department