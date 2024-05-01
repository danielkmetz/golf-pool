const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require("crypto");
const sharp = require('sharp');
const {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} = require("@aws-sdk/client-s3");
const User = require('../models/users');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
    },
    region: 'us-east-2',
});

const generateFileName = (username, bytes = 32) =>
    `${username}-${crypto.randomBytes(bytes).toString("hex")}`;

router.post('/', upload.single("image"), async (req, res) => {
    try {
        let extension = '';
        let buffer = req.file.buffer;

        if (req.file.mimetype === 'image/jpeg') {
            extension = 'jpg';
        } else if (req.file.mimetype === 'image/png') {
            extension = 'png';
        }

        buffer = await sharp(req.file.buffer)
            .jpeg()
            .toBuffer();

        const fileName = generateFileName(req.body.username, extension);
        const params = {
            Bucket: 'golf-pool-profile-pics',
            Key: fileName,
            Body: buffer,
            ContentType: req.file.mimetype,
            ContentEncoding: 'base64',
            Metadata: {
                'username': req.body.username
            }
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        const user = await User.findOne({ username: req.body.username });
        if (user) {
            user.profilePic = fileName; // Assuming you want to store the file name
            await user.save();
            return res.status(200).send({ message: 'Profile picture uploaded successfully', profilePic: fileName });
        } else {
            return res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).send({ error: 'Internal server error' });
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
