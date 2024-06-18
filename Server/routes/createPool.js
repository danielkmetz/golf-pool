const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Pool = require('../models/createPool');

router.post('/', async (req, res) => {
    const { admin, email, poolName, users } = req.body;

    try {
        // Check if a pool with the same username and pool name already exists
        const existingPool = await Pool.findOne({ admin, poolName });
        if (existingPool) {
            return res.status(400).json({ message: 'Pool with this name already exists for this user.' });
        }

        // If no duplicate is found, create a new pool
        const newPool = new Pool({
            admin,
            email,
            poolName,
            users,
        });

        await newPool.save();
        res.status(201).json(newPool);
    } catch (error) {
        res.status(500).json({ message: 'Error creating pool', error });
    }
});

//get users in specific pool
router.get('/users-in-pool', async (req, res) => {
    const { poolName } = req.query;
    try {
      // Find the pool by pool name
      const pool = await Pool.findOne({ poolName });
      if (!pool) {
        return res.status(404).json({ message: 'Pool not found' });
      }
  
      // Return the users in the pool
      res.json(pool.users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });  

router.put('/join', async (req, res) => {
    const { poolName, username, } = req.body;
    console.log(poolName);
    try {
        const pool = await Pool.findOne({ poolName });
        console.log(pool);
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        if (pool.users.includes(username)) {
            return res.status(400).json({ message: 'User already in the pool.' });
        }

        pool.users.push({username: username, email: null});
        await pool.save();

        res.status(200).json({ message: 'User added to the pool.', pool });
    } catch (error) {
        res.status(500).json({ message: 'Error joining pool', error });
    }
});

// Route to get the pool name of the current user
router.get('/user-pool-name', async (req, res) => {
    const { username } = req.query;
  
    try {
      // Find a pool where the user's username exists in the users array
      const pool = await Pool.findOne({ 'users.username': username });
      if (!pool) {
        return res.status(404).json({ message: 'User not found in any pool' });
      }
  
      // Return the pool name where the user is found
      res.json({ poolName: pool.poolName });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });  

// GET request to fetch all golf pool names
router.get('/pools', async (req, res) => {
    try {
        const pools = await Pool.find({});
        const poolNames = pools.map(pool => pool);
        res.status(200).json(poolNames);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pool names', error });
    }
});

router.delete('/remove-user', async (req, res) => {
    const { poolName, username } = req.body;

    try {
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        const userIndex = pool.users.findIndex(user => user.username === username);
        if (userIndex === -1) {
            return res.status(400).json({ message: 'User not found in the pool.' });
        }

        pool.users.splice(userIndex, 1);
        await pool.save();

        res.status(200).json({ message: 'User removed from the pool.', pool });
    } catch (error) {
        res.status(500).json({ message: 'Error removing user from pool', error });
    }
});

router.put('/update-username/:username', async (req, res) => {
    const { newUsername } = req.body;
    const oldUsername = req.params.username.trim();

    try {
        // Find all pools containing the old username in users array or as admin
        const pools = await Pool.find({ 
            $or: [{ 'users.username': oldUsername }, { admin: oldUsername }]
        });

        if (pools.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found in any pool' });
        }

        // Update username in all found pools
        for (let pool of pools) {
            // Update the username in the users array
            for (let user of pool.users) {
                if (user.username === oldUsername) {
                    user.username = newUsername.trim();
                }
            }

            // Update the username if it matches the admin
            if (pool.admin === oldUsername) {
                pool.admin = newUsername.trim();
            }

            // Save the updated pool
            await pool.save();
        }

        res.json({ success: true, message: 'Username updated successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error updating username:', error);
        res.status(500).json({ success: false, message: 'Failed to update username' });
    }
});

// Route to get the admin of a specific pool
router.get('/admin', async (req, res) => {
    const { poolName } = req.query;

    try {
        // Find the pool by pool name
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found' });
        }

        // Return the admin of the pool
        res.json({ admin: pool.admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-admin', async (req, res) => {
    const { poolName, newAdmin } = req.body;

    try {
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        pool.admin = newAdmin;
        await pool.save();

        res.status(200).json({ message: 'Admin updated successfully', newAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error updating admin', error });
    }
});

router.delete('/pool', async (req, res) => {
    const { poolName, username } = req.body;

    try {
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        const userIndex = pool.users.findIndex(user => user.username === username);
        if (userIndex === -1) {
            return res.status(400).json({ message: 'User not found in the pool.' });
        }

        // Remove the user from the pool
        pool.users.splice(userIndex, 1);

        // Check if the user is the only one in the pool and is also the admin
        if (pool.users.length === 0 && pool.admin === username) {
            // Delete the pool altogether
            await Pool.deleteOne({ poolName });
            return res.status(200).json({ message: 'Pool deleted successfully.' });
        }

        // Save the updated pool if it's not being deleted
        await pool.save();

        res.status(200).json({ message: 'User removed from the pool.', pool });
    } catch (error) {
        res.status(500).json({ message: 'Error removing user from pool', error });
    }
});

module.exports = router;

