const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const axios = require('axios');

const accountSID = 'ACacef4d39210789088aafcf02e2a8cf46';
const authToken = '0b79b471556eb899c03321d95343b07f';
const phone = '+18667812928';

const client = new twilio(accountSID, authToken);

// Function to submit toll-free verification request
const submitTollFreeVerification = async (recipient, messageVolume) => {
    const data = {
      phone_number: recipient,
      via: 'sms',
      message_volume: messageVolume // Pass the message volume parameter here
    };
  
    try {
      const response = await axios.post(
        'https://messaging.twilio.com/v1/Tollfree/Verifications',
        data,
        {
          auth: {
            username: accountSID,
            password: authToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Verification request submitted successfully:', response.data);
      return response.data; // Return the verification response
    } catch (error) {
      console.error('Error submitting toll-free verification request:', error);
      throw error; // Handle or propagate the error as needed
    }
  };
  
// Route to handle sending SMS after toll-free number verification
router.post('/send-text', async (req, res) => {
    const { recipient, textMessage, messageVolume } = req.body;
    console.log(messageVolume)
  
    try {
      // Submit toll-free number verification request
      const verificationResponse = await submitTollFreeVerification(recipient, messageVolume);
  
      // Check verification status
      if (verificationResponse.status === 'pending') {
        console.log('Verification pending:', verificationResponse);
        return res.status(400).json({ success: false, error: 'Verification pending' });
      }
  
      // Proceed to send SMS if verified
      const message = await client.messages.create({
        body: textMessage,
        to: recipient,
        from: phone,
      });
  
      res.json({ success: true, messageSid: message.sid });
    } catch (error) {
      console.error('Error sending SMS:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
module.exports = router;
