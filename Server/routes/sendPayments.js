const express = require('express');
const router = express.Router();
const CheckbookAPI = require('checkbook-api');
const authenticate = require('../middleware/authenticate');

// Initialize Checkbook with your sandbox API keys
const Checkbook = new CheckbookAPI({
    api_key: process.env.CHECKBOOK_PUBLIC,
    api_secret: process.env.CHECKBOOK_SECRET,
    env: 'live',
});

router.post('/send-payout', authenticate, async (req, res) => {
    let { email, payout } = req.body;
    const username = req.user.username;

    email = email?.trim();
    payout = payout?.toString().trim();
    const payoutAmount = Number(payout);

    if (!username || !email || isNaN(payoutAmount) || typeof username !== 'string' || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid user data' });
    }

    try {
        const sendDigitalCheck = () => {
            return new Promise((resolve, reject) => {
                Checkbook.checks.sendDigitalCheck({
                    name: username,
                    recipient: email,
                    description: 'Payout from The Golf Pool. Congratulations!',
                    amount: payout,
                }, (error, response) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });
        };

        const paymentResult = await sendDigitalCheck();

        res.status(200).json({
            message: 'Payment sent successfully',
            data: paymentResult,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send payment' });
    }
});

module.exports = router;
