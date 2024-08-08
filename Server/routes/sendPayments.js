const express = require('express');
const router = express.Router();
const CheckbookAPI = require('checkbook-api');

// Initialize Checkbook with your sandbox API keys
const Checkbook = new CheckbookAPI({
    api_key: process.env.CHECKBOOK_PUBLIC,
    api_secret: process.env.CHECKBOOK_SECRET,
    env: 'sandbox',
});

router.post('/send-payout', async (req, res) => {
    let { username, email, payout } = req.body;

    // Trim whitespace from all inputs
    username = username.trim();
    email = email.trim();
    payout = payout.toString().trim();

    // Convert payout to a number
    const payoutAmount = Number(payout);

    if (!username || !email || isNaN(payoutAmount) || typeof username !== 'string' || typeof email !== 'string') {
        console.log('Invalid user data');
        return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
        // Function to send digital check with a promise
        const sendDigitalCheck = () => {
            return new Promise((resolve, reject) => {
                Checkbook.checks.sendDigitalCheck({
                    name: username,
                    recipient: email,
                    description: 'Payout from The Golf Pool. Congratulations!',
                    amount: payoutAmount
                }, (error, response) => {
                    if (error) {
                        console.error('Error:', error);
                        reject(error);
                    } else {
                        console.log('Response:', response);
                        resolve(response);
                    }
                });
            });
        };

        // Send payment using Checkbook.io
        const paymentResult = await sendDigitalCheck();

        res.status(200).json({
            message: 'Payment sent successfully',
            data: paymentResult,
        });
    } catch (error) {
        console.error('Error sending payment:', error);
        res.status(500).json({ error: 'Failed to send payment' });
    }
});

module.exports = router;
