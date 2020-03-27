const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var Upload = require('../models/upload');


const upload = require('../video');

// const singleUpload = upload.single('video');

//SendGrid Mail
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


var bodyParser = bodyParser.urlencoded({ extended: false});



router.get('/home',(req,res)=>{
    res.render('home');
});

router.get('/register',(req,res)=>{
    res.render('register');
});

router.post('/register',bodyParser, (req,res,err)=>{
    const {username,name,email,password}= req.body;
     const newUser= new User({
         username,
         name,
         email,
         password
     });   

        //Hash Password
     bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(newUser.password, salt, (err,hash)=>
        { 
            if(err) throw err;
            //Set password to hashed
            newUser.password = hash;
            //save User
            newUser.save().then((person)=>{
                res.send(person);
            }).catch(err => {console.log(err);
                res.send(err)});
        });
    });
    if(!err)
    res.render('success');

});


router.get('/login',(req,res)=>{
    res.render('login');
});

var olduser;
router.post('/login',bodyParser,(req,res)=>{
    const {username,password}= req.body;
     User.findOne({username: username})
     .then( user=>{

        if(user) {
            olduser=username;
            console.log(user);
            bcrypt.compare(password, user.password, (err,isMatch)=>{
                if (err)
                throw err;
                if (isMatch)
                {
                   res.render('success');
                }
                else{
                   res.send("wrong password");
                }
               });} 
    });
    
   
});

router.get('/forgot',(req,res)=>{
    res.render('forgot');
});

var otp , email;

router.post('/forgot',bodyParser,(req,res)=>{
    email = req.body.email;
    User.findOne({email:email})
    .then(user=>{
     
         otp = Math.floor(Math.random() * 9000) + 1000;
        console.log(user.email);
        const msg = {
        to: user.email,
        from: 'chawlavikap2000@gmail.com',
        subject: 'OTP ',
        text: 'One Time Password is'+ otp,
        html: '<strong>One Time Password is </strong>'+otp ,
      };
      sgMail.send(msg);

    });
    
    res.render('otp');
});
router.post('/otp',bodyParser,(req,res)=>{
    console.log(otp);
    const {otp1,password}=req.body;
    const newUser = ({password});
    if(otp==otp1)
     {  
         //Hash Password
     bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(newUser.password, salt, (err,hash)=>
        { 
            if(err) throw err;
            //Set password to hashed
            newUser.password = hash;
            //update password
         
        User.findOneAndUpdate({email: email},{ $set: { password: newUser.password } }, { new: true }, (err, doc)=>{
            User.findOne({email: email}).then(
                (user)=>
                {
                    res.send(user);
                }
            )
          });
        });
       });
       }
    
});


router.get('/file-upload',function(req,res,next){
    res.render('upload'); 
});

router.post('/file-upload',upload.single('video'), function(req,res,next){
    const file = req.file.location;
    if(!file){
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    else{
        Upload.findOne({username: olduser})
     .then( user=>{
            console.log(olduser);
        if(user) {
            const doclink = file;
           
            Upload.update({username: olduser},{$push: {doclink :{ $each:doclink} }});
            Upload.findOne({username: olduser}).then(
                (user)=>{
                    if (user)
                    console.log(user+olduser);
                }
            )
        }
        else{
             const username= olduser;
             const doclink=file;
            const newUpload= new Upload({
                username,
                doclink
            });  
            newUpload.save().then((person)=>{
                res.send(person);
            }).catch(err => {console.log(err);
                res.send(err)});

        } 
        
    });
    }
    res.send(file)
});

module.exports= router;