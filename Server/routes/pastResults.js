const express = require('express');
const router = express.Router();
const pastResults = require('../models/pastResults');

// Save a new result
router.post('/save', async (req, res) => {
    try {
        const { username, results } = req.body;
        //console.log('Received results:', results); // Log received results

        if (!Array.isArray(results)) {
            return res.status(400).json({ error: 'Results must be an array' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Results array is empty' });
        }

        // Check if any result object is missing required fields
        const hasInvalidResults = results.some(
            result => !result.date || !result.tournamentName || !result.position
        );

        if (hasInvalidResults) {
            return res.status(400).json({ error: 'Results must contain date, tournamentName, and position' });
        }

        let userResults = await pastResults.findOne({ username });

        if (userResults) {
            // Ensure that the results array is properly mapped and appended
            userResults.results.push(...results.map(result => ({ ...result })));
        } else {
            userResults = new pastResults({ username, results });
        }

        await userResults.save();
        res.status(200).json({ message: 'Results saved successfully' });
    } catch (error) {
        console.error('Error saving results:', error); // Log the actual error for debugging
        res.status(500).json({ error: 'Error saving results' });
    }
});

// Fetch past results by username
router.get('/fetch/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userResults = await pastResults.findOne({ username });
        
        if (userResults) {
            res.status(200).json(userResults);
        } else {
            res.status(404).json({ error: 'No results found for this user' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching results' });
    }
});

// Update username
router.put('/update-username/:username', async (req, res) => {
    try {
        const username = req.params.username
        const { newUsername } = req.body;
        console.log(username)
        console.log(newUsername);
        if (!username || !newUsername) {
            return res.status(400).json({ error: 'Both oldUsername and newUsername are required' });
        }

        const userResults = await pastResults.findOne({ username: username });
        if (!userResults) {
            return res.status(404).json({ error: 'No results found for the old username' });
        }

        userResults.username = newUsername;
        await userResults.save();

        res.status(200).json({ message: 'Username updated successfully' });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Error updating username' });
    }
});

module.exports = router;
