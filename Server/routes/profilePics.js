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
    const fileKey = await req.file.transforms.find(transform => transform.id === 'original').key;

        try {
          const user = await User.findOne({ username: username });
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          user.profilePic = fileKey;
          
          await user.save();
          return res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePic: fileKey,
            location: req.file.location,
          });
        } catch (err) {
          console.log('Error saving profile picture to database:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
  });

// Middleware to handle JSON payload with base64 image
const handleJsonUpload = async (req, res, next) => {
  if (req.is('application/json') && req.body.image && req.body.username) {
      try {
          const { image, username } = req.body;
          const buffer = Buffer.from(image, 'base64');
          const fileKey = `profile-${Date.now()}.jpg`;

          await s3.upload({
              Bucket: 'golf-pool-profile-pics',
              Key: fileKey,
              Body: buffer,
              ContentType: 'image/jpeg',
              ACL: 'public-read'
          }).promise();

          req.file = {
              key: fileKey,
              location: `https://${s3.config.endpoint}/${fileKey}`
          };
          req.body = { username };

          next();
      } catch (error) {
          console.error('Error processing JSON upload:', error);
          return res.status(500).json({ error: 'Internal server error' });
      }
  } else {
      next();
  }
};

router.post('/native', async (req, res) => {
  const { username, imageUrl } = req.body;

  try {
      const user = await User.findOne({ username: username });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      
      user.profilePic = imageUrl;
      await user.save();
      
      res.status(200).json({
          message: 'Profile picture updated successfully',
          profilePic: imageUrl,
      });
  } catch (err) {
      console.error('Error updating profile picture:', err);
      res.status(500).json({ error: 'Internal server error' });
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

router.post('/fetch-all', async (req, res) => {
    try {
        const { profilePicData } = req.body; // Assuming req.body contains profilePicData as an object with usernames and profilePic filenames
        const profilePics = {};
        for (const { username, profilePic } of profilePicData) {
            try {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: profilePic,
                };
  
                const data = await S3.send(new GetObjectCommand(s3Params));
                console.log(data);
                const { Body } = data; 
                const chunks = [];
                Body.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                Body.on('end', () => {
                    const imageData = Buffer.concat(chunks); 
                    const base64ImageData = imageData.toString('base64'); 
                    const dataUrl = `data:${data.ContentType};base64,${base64ImageData}`; 
                    profilePics[username] = dataUrl;
                    
                    if (Object.keys(profilePics).length === profilePicData.length) {
                        res.status(200).json({ profilePics });
                    }
                });
            } catch (err) {
                console.error(`Error fetching profile picture for ${username}:`, err);
                profilePics[username] = null; // Indicate the image was not found or couldn't be fetched
                if (Object.keys(profilePics).length === profilePicData.length) {
                    res.status(200).json({ profilePics });
                }
            }
        }
    } catch (error) {
        console.error('Error fetching profile pictures:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;
