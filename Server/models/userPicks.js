const mongoose = require('mongoose');

const UserPickSchema = new mongoose.Schema({
  username: {
    type: String,
    ref: 'users', // Reference to the User model
    required: true
  },
  poolName: {
    type: String,
    default: null,
  },
  userPicks: [{tier: {type: String, required: true}, golferName: [{type: String, required: true}]}]
});

module.exports = mongoose.model('UserPick', UserPickSchema);

