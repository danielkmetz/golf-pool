const mongoose = require('mongoose');

const resultsSchema = new mongoose.Schema({
    date: Date,
    tournamentName: String,
    position: Number,
});

const pastResultsSchema = new mongoose.Schema({
    username: String,
    results: [resultsSchema],
});

const pastResults = mongoose.model('pastResults', pastResultsSchema);

module.exports = pastResults;

