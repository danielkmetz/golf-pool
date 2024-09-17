// routes/userPicks.js
const express = require('express');
const router = express.Router();
const UserPick = require('../models/userPicks');

router.post('/save', async (req, res) => {
    const { username, userPicks, poolName } = req.body; // Include poolName in the request body
    try {
        // Update or insert the userPickDocument with both the username and poolName
        let userPickDocument = await UserPick.findOneAndUpdate(
            { username, poolName }, // Use both username and poolName to identify the document
            { $set: { userPicks, poolName } }, // Save the userPicks and poolName
            { upsert: true, new: true } // upsert will create the document if it doesn't exist
        );
        
        res.status(201).json({ message: 'User pick saved successfully', userPickDocument });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving user pick' });
    }
});

router.put('/update-username/:username', async (req, res) => {
    const { newUsername } = req.body;
    const username = req.params.username;
  
    try {
      // Update all documents that match the old username
      const result = await UserPick.updateMany(
        { username }, // Find all documents with the old username
        { $set: { username: newUsername } } // Set the new username
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, message: 'Username updated successfully', updatedCount: result.modifiedCount });
    } catch (error) {
      // Handle errors
      console.error('Error updating username:', error);
      res.status(500).json({ success: false, message: 'Failed to update username' });
    }
});

router.delete('/delete-user-picks/:username/:poolName', async (req, res) => {
    const { username, poolName } = req.params;

    try {
        // Delete picks for the specified user and pool
        const result = await UserPick.deleteMany({ username, poolName });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No user picks found for the specified username and pool' });
        }

        res.status(200).json({ message: 'User picks deleted successfully' });
    } catch (error) {
        console.error('Error deleting user picks:', error);
        res.status(500).json({ message: 'Error deleting user picks' });
    }
});

router.get('/:username/:poolName', async (req, res) => {
    const { username, poolName } = req.params;
    
    try {
        // Find user picks by both username and poolName
        const userPicks = await UserPick.findOne({ username, poolName });

        if (!userPicks) {
            return res.status(404).json({ message: 'No user picks found for the specified username and pool' });
        }

        res.status(200).json(userPicks);
    } catch (error) {
        console.error('Error getting user picks:', error);
        res.status(500).json({ message: 'Error getting user picks' });
    }
});

router.get('/', async (req, res) => {
    const { poolName } = req.query;  // Retrieve poolName from query parameters

    if (!poolName) {
        return res.status(400).json({ message: 'poolName is required' });
    }

    try {
        const userPicksByPool = await UserPick.find({ poolName });
        
        if (userPicksByPool.length === 0) {
            return res.status(404).json({ message: `No user picks found for poolName: ${poolName}` });
        }

        res.status(200).json(userPicksByPool);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving user picks for the specified poolName' });
    }
});


router.post('/users-picks', async (req, res) => {
    const { usernames, poolName } = req.body; // Expect an array of usernames and a poolName

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
        return res.status(400).json({ message: 'Usernames must be a non-empty array' });
    }

    if (!poolName) {
        return res.status(400).json({ message: 'poolName is required' });
    }

    try {
        // Find all documents where username is in the provided array and poolName matches
        const userPicks = await UserPick.find({ 
            username: { $in: usernames }, 
            poolName, 
            userPicks: { $exists: true, $not: { $size: 0 } }// Exclude users with null or empty picks
        });

        if (userPicks.length === 0) {
            return res.status(404).json({ message: 'No user picks found for the specified usernames and pool' });
        }

        res.status(200).json(userPicks);
    } catch (error) {
        console.error('Error getting user picks for usernames:', error);
        res.status(500).json({ message: 'Error fetching user picks' });
    }
});

router.delete('/delete-users-picks', async (req, res) => {
    const { userPools } = req.body; // Expect an array of objects with username and poolName

    if (!userPools || !Array.isArray(userPools) || userPools.length === 0) {
        return res.status(400).json({ message: 'userPools must be a non-empty array of objects' });
    }

    try {
        // Loop through each object in the array and delete the associated user picks
        const deleteResults = await Promise.all(userPools.map(async (userPool) => {
            const { username, poolName } = userPool;

            const result = await UserPick.deleteMany({ username, poolName });
            return {
                username,
                poolName,
                deletedCount: result.deletedCount
            };
        }));

        // Check if any deletions were made
        const totalDeleted = deleteResults.reduce((acc, cur) => acc + cur.deletedCount, 0);
        
        if (totalDeleted === 0) {
            return res.status(404).json({ message: 'No user picks found for the provided usernames and pools' });
        }

        res.status(200).json({ message: 'User picks deleted successfully', deleteResults });
    } catch (error) {
        console.error('Error deleting user picks:', error);
        res.status(500).json({ message: 'Error deleting user picks' });
    }
});

module.exports = router;

