const express = require('express');
const router = express.Router();
const axios = require('axios');
const OddsModel = require('../models/golferOdds');

router.get('/', async (req, res) => {
    try {
        // Check if the database already has data
        const existingDataCount = await OddsModel.countDocuments();
        
        if (existingDataCount > 0) {
            // If data exists in the database, send the existing data as a response
            const existingData = await OddsModel.aggregate([
                // Group by player_name and take the first document encountered for each player
                { $group: { _id: "$player_name", data: { $first: "$$ROOT" } } },
                // Project to show only the data field (excluding _id and other fields)
                { $replaceRoot: { newRoot: "$data" } }
            ]);
            return res.json(existingData);
        } else {
            // If no data exists in the database, fetch new odds data from the external API
            const response = await axios.get('https://feeds.datagolf.com/betting-tools/outrights', {
                params: {
                    market: 'win',
                    odds_format: 'percent',
                    key: process.env.REACT_APP_DATA_GOLF_KEY,
                },
            });
            const oddsData = response.data.odds;

            // Save the new odds data to the database
            await OddsModel.insertMany(oddsData);

            return res.json(oddsData);
        }
    } catch (error) {
        console.error('Error fetching odds from mongo or external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = router;
