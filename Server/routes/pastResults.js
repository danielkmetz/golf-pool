const express = require('express');
const router = express.Router();
const pastResults = require('../models/pastResults');

const getPastResults = async (tournamentName, usernames, year, poolName) => {
    try {
        const results = await pastResults.find({
            'results.tournamentName': tournamentName,
            username: { $in: usernames },
            'results.year': year,
            'results.poolName': poolName,
        });
        return results;
    } catch (error) {
        throw new Error('Failed to fetch past results');
    }
};

router.post('/weekly', async (req, res) => {
    const { tournamentName, usernames, year, poolName } = req.body;
    if (!tournamentName || !usernames || !year || !poolName) {
        return res.status(400).json({ error: 'Missing tournamentName, usernames, year, or poolName' });
    }

    try {
        const results = await getPastResults(tournamentName, usernames, year, poolName);

        // Structure the results
        const structuredResults = usernames.map(username => {
            const userResults = results.find(result => result.username === username);
            if (userResults) {
                // Filter results by tournamentName, year, and poolName
                const filteredResults = userResults.results.filter(result => 
                    result.tournamentName === tournamentName && 
                    result.year === year &&
                    result.poolName === poolName // Add this check for poolName
                );
                return {
                    username: userResults.username,
                    results: filteredResults
                };
            }
            return { username, results: [] };
        });

        res.json(structuredResults);
    } catch (error) {
        console.error('Failed to fetch past results:', error);
        res.status(500).json({ error: 'Failed to fetch past results' });
    }
});

// Save a new result
router.post('/save', async (req, res) => {
    try {
        const { username, results } = req.body;
        console.log('Received results:', results); // Log received results

        if (!Array.isArray(results)) {
            return res.status(400).json({ error: 'Results must be an array' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Results array is empty' });
        }

        // Check if any result object is missing required fields
        const hasInvalidResults = results.some(
            result => !result.year || !result.tournamentName || !result.position || !result.poolName
        );

        if (hasInvalidResults) {
            return res.status(400).json({ error: 'Results must contain date, tournamentName, and position' });
        }

        let userResults = await pastResults.findOne({ username });

        if (userResults) {
            console.log('Existing user results:', userResults.results); // Log existing results

            // Filter out duplicate results
            const existingResultsSet = new Set(
                userResults.results.map(result => `${result.date}_${result.tournamentName}_${result.position}_${result.poolName}`)
            );

            const newResults = results.filter(
                result => !existingResultsSet.has(`${result.date}_${result.tournamentName}_${result.position}_${result.poolName}`)
            );

            console.log('New results to be added:', newResults); // Log new results

            if (newResults.length === 0) {
                return res.status(200).json({ message: 'No new results to save' });
            }

            userResults.results.push(...newResults);
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

// Update multiple instances of username
router.put('/update-username/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const { newUsername } = req.body;

        if (!username || !newUsername) {
            return res.status(400).json({ error: 'Both oldUsername and newUsername are required' });
        }

        // Find all instances of past results with the old username
        const userResults = await pastResults.find({ username: username });
        
        if (userResults.length === 0) {
            return res.status(404).json({ error: 'No results found for the old username' });
        }

        // Update the username for all instances
        for (let result of userResults) {
            result.username = newUsername;
            await result.save(); // Save each updated document
        }

        res.status(200).json({ message: 'Username updated successfully in multiple instances' });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Error updating username' });
    }
});

// DELETE endpoint to delete a user and their past results
router.delete('/delete-user/:username', async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Find and delete the user's past results by username
        const deletedUser = await pastResults.findOneAndDelete({ username });

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User and their past results deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
