const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    paymentStatus: {
        type: Boolean,
        default: false,
    }
});

const payoutSchema = new mongoose.Schema({
    first: Number,
    second: Number,
    third: Number,
});

const tournamentSchema = new mongoose.Schema({
    City: String,
    Club: String,
    Country: String,
    Name: String,
    Par: Number,
    Starts: String,
    State: String,
    Week: Number,
    _id: String,
});

const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  });

const poolSchema = new mongoose.Schema({
    admin: String,
    email: String,
    poolName: String,
    format: String,
    maxUsers: {
        type: Number,
        default: null,
    },
    buyIn: Number,
    payouts: [payoutSchema],
    users: [userSchema],
    isPrivate: Boolean,
    password: String,
    numTournaments: Number,
    tournaments: [tournamentSchema],
    round: String,
    balancesUpdated: Boolean,
    messages: {
        type: [messageSchema],
        default: [],
    }
});

const createPool = mongoose.model('Pool', poolSchema);

module.exports = createPool;
