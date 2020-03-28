const express = require('express');
const router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var Upload = require('../models/upload');


const upload = require('../video');


//SendGrid Mail
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


var bodyParser = bodyParser.urlencoded({ extended: false });


//HOME
router.get('/home', (req, res) => {
    res.render('home',{data: "Welcome to Home"});
});


//Register Get
router.get('/register', (req, res) => {
    res.render('register');
});


//Register Post
router.post('/register', bodyParser, (req, res, err) => {
    const { username, name, email, password } = req.body;
    const newUser = new User({
        username,
        name,
        email,
        password
    });

    if(!username|!name|!email|!password)
     res.render('error',{error:"All Fields required , Fill all fields"});

     User.findOne({username:username}).then(
         user =>{
             if(user)
             res.render('error',{error:"Username alredy Used try another"});
             else{
                User.findOne({email:email}).then(
                    user =>{
                        if(user)
                        res.render('error',{error:"email alredy Used try another"});
                        else{
                            //Hash Password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) res.render('error',{error:err});
            //Set password to hashed
            newUser.password = hash;
            //save User
            newUser.save().then((person) => {
                console.log(person);
                res.render('home',{data: "Registerd Succesfully"});
            }).catch(err => {
                console.log(err);
                res.render('error',{error:err});
            });
        });
    });  
                        }
                    });
             }
         }
     )

    
        

});



//Login GET
router.get('/login', (req, res) => {
    res.render('login');
});


//Login POST
var olduser;
router.post('/login', bodyParser, (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username: username })
        .then(user => {

            if (user) {
                olduser = username;
                console.log(user);
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err)
                        throw err;
                    if (isMatch) {
                        res.render('success',{data: username});
                    }
                    else {
                        res.render('error',{error:"Wrong Password"});
                    }
                });
            }
            else
            res.render('error',{error:"No such User Exists"});
        });


});


//Forgot password GET
router.get('/forgot', (req, res) => {
    res.render('forgot');
});

var otp, email;


//Forgot Password Post
router.post('/forgot', bodyParser, (req, res) => {
    email = req.body.email;
    User.findOne({ email: email })
        .then(user => {

            if(user)
                    {
                        otp = Math.floor(Math.random() * 9000) + 1000;
            console.log(user.email);
            const msg = {
                to: user.email,
                from: 'chawlavikap2000@gmail.com',
                subject: 'OTP ',
                text: 'One Time Password is' + otp + ' which is valid for 2 min',
                html: '<strong>One Time Password is </strong>' + otp + ' <strong>which is valid for 2 min</strong>',
            };
            sgMail.send(msg);
            setInterval(() => {
                otp = Math.floor(Math.random() * 9000) + 1000;
                console.log(otp);
            }, 120000);
            res.render('otp');
                    }
          else{
              res.render('error',{error:"Email Id not registered"});
          }

        });

   
});


//OTP POST
router.post('/otp', bodyParser, (req, res) => {
    console.log(otp);
    const { otp1, password } = req.body;
    const newUser = ({ password });
    if (otp == otp1) {
        //Hash Password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                otp = null;
                if (err) throw err;
                //Set password to hashed
                newUser.password = hash;
                //update password

                User.findOneAndUpdate({ email: email }, { $set: { password: newUser.password } }, { new: true }, (err, doc) => {
                    User.findOne({ email: email }).then(
                        (user) => {
                            res.render('home',{data: "Password Updated"});
                        }
                    )
                });
            });
        });
    }
    else
    res.render('error',{error:"Invalid OTP / OTP expired"});

});


//File Upload GET
router.get('/file-upload', function (req, res, next) {
    if(olduser==null)
    {
        res.render('error',{error:"Login First"});
    }
    else
    { res.render('upload');
}
});


//File Upload POST
router.post('/file-upload', upload.single('video'), function (req, res, next) {
    if(olduser==null)
    {
        res.render('error',{error:"Login First"});
    }
    else
    {
        const file = req.file.location;
    if (!file) {
        const error1 = new Error('Please upload a file')
        error1.httpStatusCode = 400
        // return next(error)
        res.render('error',{error:error1});
    }
    else {
        Upload.findOne({ username: olduser })
            .then(user => {
                console.log(olduser);
                if (user) {
                    const doclink1 = file;

                    Upload.findOneAndUpdate({ username: olduser }, { $push: { doclink: doclink1 } }, (err, doc) => {
                        Upload.findOne({ username: olduser }).then(
                            (user) => {
                                res.render('successsupload',{data:doclink1});
                            }
                        )
                    });

                }
                else {
                    const username = olduser;
                    const doclink = file;
                    const newUpload = new Upload({
                        username,
                        doclink
                    });
                    newUpload.save().then((person) => {
                        console.log(person);
                    }).catch(err => {
                        console.log(err);
                        res.render('error',{error:err});
                    });
                    if(!err)
                    res.render('successsupload',{data:doclink});

                }

            });
    }
    }

});



//Get all media
router.get('/allmedia', bodyParser, (req, res) => {
    if (olduser==null)
    {
        res.render('error',{error:"Login First"});
    }
    else
    {
        Upload.find({ username: olduser }).then(
            data => {
                console.log(data);
                if (data){
                    res.render('allmedia',{item:data})
                }
                else
                {
                    res.render('error',{error:"Login First"});
                }
            }
        )
    }
})



//LogOut GET
router.get('/logout',(req,res)=>{
    olduser=null;
    res.render('home',{data: "You Are logged out"});
})
module.exports = router;