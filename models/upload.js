const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
            type:String,
    },
    doclink:{
            type:[String],
    }
})

const Upload = mongoose.model('Upload',UserSchema);
module.exports = Upload;