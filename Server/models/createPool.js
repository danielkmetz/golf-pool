const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
});

const payoutSchema = new mongoose.Schema({
    first: Number,
    second: Number,
    third: Number,
})

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
});

const createPool = mongoose.model('Pool', poolSchema);

module.exports = createPool;
