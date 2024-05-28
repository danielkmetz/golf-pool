const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: 'us-east-2',
})

const s3 = new AWS.S3();

router.get('/api/get-video-url', (req, res) => {
  const { key } = req.query;
  const params = {
    Bucket: 'golf-pool-tutorial',
    Key: key,
    Expires: 60 * 60 // URL expiration time in seconds
  };

  s3.getSignedUrl('getObject', params, (err, url) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ url });
  });
});

module.exports = router;