const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
});

const poolSchema = new mongoose.Schema({
    admin: String,
    email: String,
    poolName: String,
    users: [userSchema], // Array of user subdocuments
});

const createPool = mongoose.model('Pool', poolSchema);

module.exports = createPool;
