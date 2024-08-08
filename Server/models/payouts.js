const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, required: true },
  payout: { type: Boolean, default: true }
});

const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;
