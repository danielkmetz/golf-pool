const express = require('express');
const router = express.Router();
const Pool = require('../models/createPool');

router.post('/', async (req, res) => {
    const { admin, email, poolName, format, maxUsers,
         buyIn, payouts, users, isPrivate, password, numTournaments, tournaments, round } = req.body;

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
            format,
            maxUsers,
            buyIn,
            payouts,
            users,
            isPrivate,
            password,
            numTournaments,
            tournaments,
            round,
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
  
      // Extract the array of users
      const users = pool.users;
  
      // Use a Set to filter out duplicate usernames
      const uniqueUsernames = new Set();
      const uniqueUsers = [];
  
      users.forEach(user => {
        if (!uniqueUsernames.has(user.username)) {
          uniqueUsernames.add(user.username);
          uniqueUsers.push(user);
        }
      });
  
      // Return the unique users in the pool
      res.json(uniqueUsers);
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
      const pool = await Pool.findOne({ 'users.username': username }).select('poolName');
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
  
// Route to get the pool name of the current user
router.get('/my-pool-info', async (req, res) => {
    const { poolName } = req.query;
  
    try {
      // Find a pool where the user's username exists in the users array
      const pool = await Pool.findOne({ poolName });
      if (!pool) {
        return res.status(404).json({ message: 'User not found in any pool' });
      }
  
      // Return the pool name where the user is found
      res.json({ pool });
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

//remove user from pool
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

router.put('/edit-pool', async (req, res) => {
    const { oldPoolName, newPoolName, newAdmin, newBuyIn, maxUsersValue, newPayouts } = req.body;

    try {
        // Find the pool by old pool name
        const pool = await Pool.findOne({ poolName: oldPoolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        // Update the pool name if newPoolName is provided
        if (newPoolName) {
            pool.poolName = newPoolName;
        }

        // Update the admin if newAdmin is provided
        if (newAdmin) {
            pool.admin = newAdmin;
        }

        if (newBuyIn) {
            pool.buyIn = newBuyIn;
        }

        // Update the maxUsers if newMaxUsers is provided
        if (maxUsersValue || maxUsersValue === null) {
            pool.maxUsers = maxUsersValue;
        }

        // Update the payouts if newPayouts is provided
        if (newPayouts) {
            pool.payouts = newPayouts;
        }

        await pool.save();

        res.status(200).json(pool);
    } catch (error) {
        res.status(500).json({ message: 'Error updating pool', error });
    }
});

// DELETE request to remove a pool entirely
router.delete('/delete-pool', async (req, res) => {
    const { poolName } = req.body;

    try {
        // Find and delete the pool by pool name
        const pool = await Pool.findOneAndDelete({ poolName });
        
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        res.status(200).json({ message: 'Pool deleted successfully.', pool });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting pool', error });
    }
});

// Get a user's payment status using poolName and username
router.get('/payment-status', async (req, res) => {
    const { poolName, username } = req.query;

    try {
        // Find the pool by pool name
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        // Find the user in the pool's users array
        const user = pool.users.find(user => user.username === username);
        if (!user) {
            return res.status(404).json({ message: 'User not found in this pool.' });
        }

        // Return the user's payment status
        res.status(200).json({ paymentStatus: user.paymentStatus });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ message: 'Error fetching payment status', error });
    }
});

// Update a user's payment status to false using poolName and username
router.put('/update-payment-status', async (req, res) => {
    const { poolName, username } = req.body;

    try {
        // Find the pool by pool name
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        // Find the user in the pool's users array
        const user = pool.users.find(user => user.username === username);
        if (!user) {
            return res.status(404).json({ message: 'User not found in this pool.' });
        }

        // Update the user's payment status to false
        user.paymentStatus = true;
        await pool.save();

        res.status(200).json({ message: 'Payment status updated to true.', user });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Error updating payment status', error });
    }
});


// Update payment status to false for a batch of users in a pool
router.put('/batch-update-payment-status', async (req, res) => {
    const { poolName, usernames } = req.body;

    try {
        // Find the pool by pool name
        const pool = await Pool.findOne({ poolName });
        if (!pool) {
            return res.status(404).json({ message: 'Pool not found.' });
        }

        // Update the payment status of each user in the usernames array
        const updatedUsers = [];
        pool.users.forEach(user => {
            if (usernames.includes(user.username)) {
                user.paymentStatus = false;
                updatedUsers.push(user.username);
            }
        });

        // Save the updated pool document
        await pool.save();

        // Return the updated list of users whose payment status was changed
        res.status(200).json({ message: 'Payment status updated to false for selected users.', updatedUsers });
    } catch (error) {
        console.error('Error updating payment status for batch:', error);
        res.status(500).json({ message: 'Error updating payment status for batch', error });
    }
});

router.get('/all-pools', async (req, res) => {
    const { username } = req.query;
  
    try {
      // Find all pools where the user's username exists in the users array
      const pools = await Pool.find({ 'users.username': username }).select('poolName');
      if (!pools.length) {
        return res.status(404).json({ message: 'User not found in any pool' });
      }
  
      // Return an array of pool names where the user is found
      res.json({ poolNames: pools.map(pool => pool.poolName) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;

