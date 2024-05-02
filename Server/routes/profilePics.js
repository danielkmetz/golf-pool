const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");
const User = require('../models/users');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: 'us-east-2',
});

function checkFileType( file, cb ){
	// Allowed ext
	const filetypes = /jpeg|jpg|png|gif|heic/;
	// Check ext
	const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
	// Check mime
	const mimetype = filetypes.test( file.mimetype );
	if( mimetype && extname ){
		return cb( null, true );
	} else {
		cb( 'Error: Images Only!' );
	}
}

const profileImgUpload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'golf-pool-profile-pics',
		key: function (req, file, cb) {
			cb(null, path.basename(
                file.originalname,
                path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
		}
	}),
	limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
	fileFilter: function( req, file, cb ){
		checkFileType( file, cb );
	}
}).single('image');

    
router.post('/', async (req, res) => {
    profileImgUpload(req, res, async (error) => {
        if (error) {
            console.log('Error uploading profile image:', error);
            return res.status(400).json({ error: 'Error uploading profile image' });
        }

        // If Success
        const imageName = req.file.key;
        const imageLocation = req.file.location;

        // Save the file name into database into profile model
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            user.profilePic = imageName;
            await user.save();
            return res.status(200).json({
                message: 'Profile picture uploaded successfully',
                profilePic: imageName,
                location: imageLocation });
        } catch (err) {
            console.log('Error saving profile picture to database:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
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

        const data = await s3.send(new GetObjectCommand(s3Params));
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
