// users.js
const getNextThursdayDate = require('../utils');
const express = require('express');
const router = express.Router();
const User = require('../models/users');
const crypto = require('crypto'); // For generating random tokens
const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk'); // For sending emails via AWS SES
const rateLimit = require('express-rate-limit');

// Configure AWS SES
const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-2',
});

const fingerprintLimiter = new Map();

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: 'Too many password reset attempts from this IP, please try again later.',
});

const resetPasswordRequestHandler = async (req, res) => {
  const { username, email, fingerprint } = req.body;

  // Custom fingerprint-based rate limiting
  const now = Date.now();
  const requestWindow = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;

  // Check fingerprint-based rate limit
  if (fingerprintLimiter.has(fingerprint)) {
    const { count, firstRequest } = fingerprintLimiter.get(fingerprint);
    if (now - firstRequest < requestWindow && count >= maxRequests) {
      return res.status(429).json({ message: 'Too many password reset attempts, please try again later.' });
    } else if (now - firstRequest > requestWindow) {
      // Reset the count and timestamp if the time window has passed
      fingerprintLimiter.set(fingerprint, { count: 1, firstRequest: now });
    } else {
      // Increment the request count
      fingerprintLimiter.set(fingerprint, { count: count + 1, firstRequest });
    }
  } else {
    // First request from this fingerprint within the time window
    fingerprintLimiter.set(fingerprint, { count: 1, firstRequest: now });
  }

  // Find the user by their username and email
  try {
    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist.' });
    }

    // Generate a reset token and expiration time (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetToken = hashedToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Create the password reset link
    const resetLink = `https://the-golf-pool.com/reset-password/${resetToken}`;

    // Send the email using AWS SES
    const params = {
      Source: 'thegolfpoolhelp@gmail.com', // Must be a verified email in SES
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Password Reset Request',
        },
        Body: {
          Html: {
            Data: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <p><a href="${resetLink}">Reset Password</a></p>
                   <p>If you did not request a password reset, please ignore this email.</p>`,
          },
        },
      },
    };

    // Send the email
    await ses.sendEmail(params).promise();
    res.status(200).json({ message: 'Password reset email sent.' });

  } catch (error) {
    console.error('Error processing password reset:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Cleanup expired entries in the fingerprintLimiter map (runs every minute)
setInterval(() => {
  const now = Date.now();
  fingerprintLimiter.forEach((value, key) => {
    if (now - value.firstRequest > 15 * 60 * 1000) {
      fingerprintLimiter.delete(key); // Remove expired entries
    }
  });
}, 60 * 1000); // Run cleanup every minute

// Attach the rate limiter and the request handler to the endpoint
router.post('/request-reset-password', passwordResetLimiter, resetPasswordRequestHandler);

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate the new password
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 1) {
      return res.status(400).json({ message: 'Invalid or missing new password. It must be at least 1 character long.' });
    }

    // Find the user by reset token and ensure it's not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }, // Ensure token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password and clear the reset token fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    const { username } = req.params;
    const deletedUser = await User.findOneAndDelete({ username });

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
    // Get the current time
    let now = new Date();
    
    // Subtract 5 hours from the current time
    now.setHours(now.getHours() - 5);

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

// Route to store or update a user's push token
router.put('/pushToken/:username', async (req, res) => {
  try {
    const { pushToken, experienceId } = req.body;

    if (!pushToken || !experienceId) {
      return res.status(400).json({ message: 'Push token and experience ID are required' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { userPushToken: pushToken, experienceId: experienceId },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Push token and experience ID updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to delete a user's push token and experience ID
router.delete('/pushToken/:username', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { userPushToken: null, experienceId: null },  // Setting both token and experience ID to null to indicate deletion
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Push token and experience ID deleted successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to retrieve a user's push token and experience ID (use with caution)
router.get('/pushToken/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ pushToken: user.userPushToken, experienceId: user.experienceId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

