const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
            type:String,
    },
    name:{
            type:String,
    },
    email:{
           type:String,
    },
    password:{
        type:String,
    },
    date:{
        type:String,
        default:Date.now(),
    }
})

const User = mongoose.model('NewUser',UserSchema);
module.exports = User;