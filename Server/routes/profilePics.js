const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3-transform');
const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");
const User = require('../models/users');
const sharp = require('sharp');
const aws = require('aws-sdk');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const S3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: 'us-east-2',
});

const s3 = new aws.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'us-east-2',
})

// Set up Multer with S3 and Sharp for image compression
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'golf-pool-profile-pics',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      shouldTransform: function (req, file, cb) {
        cb(null, /^image/i.test(file.mimetype));
      },
      transforms: [{
        id: 'original',
        key: function (req, file, cb) {
            const uniqueFilename = `profile-${Date.now()}${path.extname(file.originalname)}`;
            console.log("generated unique name:", uniqueFilename);
            cb(null, uniqueFilename);
          },
        transform: function (req, file, cb) {
          const transformer = sharp().resize(500).jpeg({ quality: 70 });
          cb(null, transformer);
        }
      }]
    }),
});

router.post('/', upload.single('image'), async (req, res) => {
    const { username } = await req.body; // Assuming username is provided in the request body
    console.log(req.file)
    const fileKey = await req.file.transforms.find(transform => transform.id === 'original').key;

        try {
          const user = await User.findOne({ username: username });
          console.log(user);
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          console.log(req.file);
          user.profilePic = await fileKey;
          
          await user.save();
          return res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePic: req.file.key,
            location: req.file.location,
          });
        } catch (err) {
          console.log('Error saving profile picture to database:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  });
        
    

router.get('/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const profilePicFileName = user.profilePic;
        if (!profilePicFileName) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        const s3Params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: profilePicFileName,
        };

        const data = await S3.send(new GetObjectCommand(s3Params));
        const { Body } = data; // Assuming `response` is the object containing your data
        const chunks = [];
        Body.on('data', (chunk) => {
        chunks.push(chunk);
        });
        Body.on('end', () => {
        const imageData = Buffer.concat(chunks); // Combine all chunks into a single buffer
        const base64ImageData = imageData.toString('base64'); // Encode as base64
        const dataUrl = `data:${data.ContentType};base64,${base64ImageData}`; // Data URL for image
        // Now you can use `dataUrl` in your frontend to display the image
        res.send(dataUrl);
    });
        
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
