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
           unique: true,
    },
    password:{
        type:String,
    }
})

const User = mongoose.model('NewUser',UserSchema);
module.exports = User;