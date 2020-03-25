const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');

router.get('/home',(req,res)=>{
    res.render('home');
});

router.get('/register',(req,res)=>{
    res.render('register');
});

router.post('/register', (req,res)=>{
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
            }).catch(err => console.log(err));
        });
    });
    res.render('success');
});


router.get('/login',(req,res)=>{
    res.render('login');
});

router.post('/login',(req,res)=>{
    const {username,password}= req.body;
    
    res.render('success');
});

router.get('/forgot',(req,res)=>{
    res.render('forgot');
});
router.post('/forgot',(req,res)=>{
    res.render('otp');
});
router.put('/forgot',(req,res)=>{
    res.send("otp");
});

module.exports= router;