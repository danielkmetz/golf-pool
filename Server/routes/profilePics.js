const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const multerS3 = require('multer-s3');
const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");
const User = require('../models/users');
const sharp = require('sharp');

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
	fileFilter: function( req, file, cb ){
		checkFileType( file, cb );
	}
}).single('image');

// Define AWS S3 upload function
function uploadToS3(file, callback) {
    const params = {
        Bucket: 'golf-pool-profile-pics',
        Key: function (req, file, cb) {
			cb(null, path.basename(
                file.originalname,
                path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
		}, // Adjust the key/path as needed
        Body: file,
        ContentType: 'image/jpeg', // Set the content type according to your image format
    };

    s3.upload(params, callback);
}
    
router.post('/', async (req, res) => {
    profileImgUpload(req, res, async (error) => {
        if (error) {
            console.log('Error uploading profile image:', error);
            return res.status(400).json({ error: 'Error uploading profile image' });
        }
        console.log(req.file);

        // Compress the image before uploading to S3
        try {
            const compressedImage = await sharp(req.file.buffer)
                .resize({ width: 800 }) // Adjust the resize parameters as needed
                .toBuffer();
            
            uploadToS3(compressedImage, async (err, data) => {
                if (err) {
                    console.error('Error uploading image to S3:', err);
                    return res.status(500).json({ error: 'Error uploading image to S3' });
                }
                // If Success
                const imageName = data.key; // Use the key provided by S3
                const imageLocation = data.Location; // Use the location provided by S3

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
                        location: imageLocation
                    });
                } catch (err) {
                    console.log('Error saving profile picture to database:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
            });
        } catch (err) {
            console.error('Error compressing image:', err);
            return res.status(500).json({ error: 'Error compressing image' });
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
