var express = require('express');
var bodyParser = require('body-parser');
var mongoose= require('mongoose');
var app = express();
app.use(bodyParser.json());
var bodyParser = bodyParser.urlencoded({ extended: false});

app.set('view engine', 'ejs');

//Db config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db, {useUnifiedTopology: true, useNewUrlParser: true})
 .then(()=> console.log('MongoDb Connected...'))
 .catch(err=> console.log(err));

//Routes
app.use('/',require('./routes/register'));

app.listen(process.env.PORT||8000,()=>{
    console.log("Port running Succesfully");
})