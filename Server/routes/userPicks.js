// routes/userPicks.js
const express = require('express');
const router = express.Router();
const UserPick = require('../models/userPicks');
const cron = require('node-cron');

cron.schedule('0 0 * * 1', async () => {
    try {
        await deleteAllUserPicks();
        console.log('Automatic deletion of user picks executed successfully.');
    } catch (error) {
        console.error('Error executing automatic deletion:', error);
    }
});

async function deleteAllUserPicks() {
    await UserPick.deleteMany({}); // Deletes all documents in the collection
}

router.post('/save', async (req, res) => {
    const { username, userPicks } = req.body;
    try {
        let userPickDocument = await UserPick.findOneAndUpdate(
            { username },
            { $set: { userPicks } },
            { upsert: true, new: true }
        );
        res.status(201).json({ message: 'User pick saved successfully', userPickDocument });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving user pick' });
    }
});

router.delete('/delete-user-picks/:username', async (req, res) => {
    const { username } = req.params;

    try {
        await UserPick.deleteMany({ username: username }); // Delete picks for the specified user
        res.status(200).json({ message: 'User picks deleted successfully' });
    } catch (error) {
        console.error('Error deleting user picks:', error);
        res.status(500).json({ message: 'Error deleting user picks' });
    }
});

router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const userPicks = await UserPick.findOne({ username: username });
        console.log(userPicks)
        res.status(200).json(userPicks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting user picks' });
    }
});

router.get('/', async (req, res) => {
    try {
        const allUserPicks = await UserPick.find();
        res.status(200).json(allUserPicks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting all user picks' });
    }
});


module.exports = router;

