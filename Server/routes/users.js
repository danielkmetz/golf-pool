// users.js
const getNextThursdayDate = require('../utils');
const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Assuming your User model is in models/User.js
const cron = require('node-cron');
const Pool = require('../models/createPool')

cron.schedule('0 0 * * 0', async () => {
  try {
    // Update the paymentStatus of all users to false
    await User.updateMany({}, { paymentStatus: false });
    console.log('Payment statuses reset to false for all users');
  } catch (error) {
    console.error('Error resetting payment statuses:', error);
  }
});

// Route to get all users (for admin purposes, optional)
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get a specific user by ID
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findById(req.params.username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to delete a user
router.delete('/:username', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get a specific email by username
router.get('/email/:username', async (req, res) => {
  try {
    const user = await User.findOne({username: req.params.username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({email: user.email});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to update payment status (for successful payments)
router.put('/paymentStatus/:username', async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { paymentStatus: paymentStatus, paymentExpiryDate: getNextThursdayDate() },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Payment status updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get payment information for a specific user
router.get('/paymentStatus/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      paymentStatus: user.paymentStatus,
      paymentExpiryDate: user.paymentExpiryDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/lastReadTimestamp/:username', async (req, res) => {
  try {
    const now = new Date();
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { lastReadMessageTimestamp: now },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/lastReadTimestamp/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ lastReadTimestamp: user.lastReadMessageTimestamp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

