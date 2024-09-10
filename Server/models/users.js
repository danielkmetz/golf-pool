const mongoose = require('mongoose');

// Import the function to get the next Thursday date
const getNextThursdayDate = require('../utils');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    paymentExpiryDate: Date,
    email: String,
    profilePic: String,
    lastReadMessageTimestamp: {
      type: Date,
      default: Date.now,
    },
    userPushToken: { 
      type: String,
      default: null,
    },
    positionNotification: {
      type: Boolean,
      default: false,
    },
});

// Middleware to update payment expiry date before saving the user
UserSchema.pre('save', async function(next) {
  if (this.isModified('paymentStatus') && this.paymentStatus) {
    // If payment status is being updated to true (i.e., paid)
    this.paymentExpiryDate = getNextThursdayDate(); // Set the next Thursday date
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;


