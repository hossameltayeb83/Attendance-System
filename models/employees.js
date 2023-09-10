const mongoose = require('mongoose')
const employeeSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true, 'first name can not be empty']
    },
    secondName:{
        type:String,
        required:[true, 'second name can not be empty']
    },
    password:{
        type:String,
        required:[true, 'password name can not be empty']
    },
    email:{
        type:String,
        required:[true, 'email name can not be empty']
    },   
    department:{
        type:String,
        
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isHOD:{
        type:Boolean,
        default:false
    },
    isAvailable:{
        type:Boolean,
        default:false
    }
})

const Employee = mongoose.model('Employee',employeeSchema)
module.exports = Employee