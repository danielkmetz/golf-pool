const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    Starts: Date,
    Name: String,
    State: String,
    City: String,
    Country: String,
    Club: String,
    Par: Number,
});

const scheduleModel = mongoose.model('schedule', scheduleSchema);

module.exports = scheduleModel;