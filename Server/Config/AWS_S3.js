const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Initialize S3 Client
const s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Function to upload a file
async function uploadFile(file) {
    // Use the buffer directly as the Body
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.originalname,  // Using original name from the file uploaded by the user
        Body: file.buffer,  // Directly use the buffer from memory storage
    };

    try {
        const data = await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(data);
        return data; // This will return the response from S3
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

module.exports = { uploadFile };
