const express = require('express');
const router = express.Router();
const Balance = require('../models/accountBalance'); // Adjust the path to your Balance model

// Helper function to get today's date in YYYY/MM/DD format
const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

// POST endpoint to adjust user balance
router.post('/update-balance', async (req, res) => {
    const {users} = req.body;

    if (!Array.isArray(users) || users.some(user => !user.username || !user.email || user.adjustment === undefined)) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        const today = getCurrentDate();
        const updatePromises = users.map(async ({ username, email, adjustment }) => {
            let user = await Balance.findOne({ username, email });

            if (!user) {
                // If the user does not exist, create a new user with the initial balance set to the adjustment
                user = new Balance({
                    username,
                    email,
                    balance: adjustment,
                    dateUpdated: today
                });
            } else {
                // If the user exists, check if the balance was already updated today
                if (user.dateUpdated === today) {
                    return { username, email, message: 'Balance already updated today', balance: user.balance };
                }

                // Update the balance and dateUpdated
                user.balance += adjustment;
                user.dateUpdated = today;
            }

            // Save the user document
            await user.save();

            return { username, email, message: 'Balance updated successfully', balance: user.balance };
        });

        const results = await Promise.all(updatePromises);

        res.status(200).json({ results });
    } catch (error) {
        console.error('Error updating balances:', error);
        res.status(500).json({ error: 'Failed to update balances' });
    }
});

// GET endpoint to get user balance
router.get('/get-balance', async (req, res) => {
    const { username, email } = req.query;

    if (!username || !email) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        // Find the user by username and email
        const user = await Balance.findOne({ username, email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ balance: user.balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// POST endpoint to change user's username
router.post('/change-username', async (req, res) => {
    const { username, email, newUsername } = req.body;

    if (!username || !email || !newUsername) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        // Find the user by current username and email
        const user = await Balance.findOne({ username, email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the username
        user.username = newUsername;

        // Save the updated user document
        await user.save();

        res.status(200).json({ message: 'Username updated successfully', username: user.username });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Failed to update username' });
    }
});

// POST endpoint to withdraw balance for a single user
router.post('/withdraw-balance', async (req, res) => {
    const { username, email, adjustment } = req.body;
    if (!username || !email || adjustment === undefined) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        // Find the user by username and email
        let user = await Balance.findOne({ username, email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the balance
        if (user.balance + adjustment < 0) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        user.balance += adjustment;

        // Save the user document
        await user.save();

        res.status(200).json({ message: 'Balance updated successfully', balance: user.balance });
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

module.exports = router;
