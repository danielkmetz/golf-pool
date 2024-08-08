const mongoose = require('mongoose');

const accountBalanceSchema = new mongoose.Schema({
    username: String,
    email: String,
    dateUpdated: String,
    balance: Number,
});

const Balance = mongoose.model('Balance', accountBalanceSchema);

module.exports = Balance

