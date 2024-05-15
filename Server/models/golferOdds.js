const mongoose = require('mongoose');

const oddsSchema = new mongoose.Schema({
    bet365: Number,
    betcris: Number,
    betfair: Number,
    betmgm: Number,
    betonline: Number,
    bovada: Number,
    caesars: Number,
    datagolf: {
        type: Object,
        default: {},
    },
    dg_id: Number,
    draftkings: Number,
    fanduel: Number,
    pinnacle: Number,
    player_name: String,
    pointsbet: Number,
    skybet: Number,
    unibet: Number,
    williamhill: Number,
});

const OddsModel = mongoose.model('Golfer-Odds', oddsSchema);

module.exports = OddsModel;

