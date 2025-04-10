const mongoose = require('mongoose');

const scoresSchema = new mongoose.Schema({
    R1: Number,
    R2: Number,
    R3: Number,
    R4: Number,
    Total: Number,
})

const resultsSchema = new mongoose.Schema({
    year: Number,
    tournamentName: String,
    position: String,
    poolName: String,
    scores: scoresSchema,
});

const pastResultsSchema = new mongoose.Schema({
    username: String,
    results: [resultsSchema],
});

const pastResults = mongoose.model('pastResults', pastResultsSchema);

module.exports = pastResults;

