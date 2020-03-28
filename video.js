const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
    secretAccessKey:'zk1pW0AKt99yF2TkATWXzG8Q2lEjSUFhP+ngPNrG',
    accessKeyId: 'AKIAJSVSNKW5K5OYFN3Q',
    region: 'ap-south-1'
});

const s3 = new aws.S3();
 
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'datapackets',
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname)
    }
  }),
})

module.exports=upload;