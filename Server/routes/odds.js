const express = require('express');
const router = express.Router();
const axios = require('axios');

const OddsModel = require('../models/golferOdds');

router.get('/', async (req, res) => {
    try {
      // Check if the database already has data
      const existingDataCount = await OddsModel.countDocuments();
      console.log(existingDataCount)
      
      // If data exists in the database, send the existing data as a response
      const existingData = await OddsModel.aggregate([
        // Group by player_name and take the first document encountered for each player
        { $group: { _id: "$player_name", data: { $first: "$$ROOT" } } },
        // Project to show only the data field (excluding _id and other fields)
        { $replaceRoot: { newRoot: "$data" } }
      ]);
      return res.json(existingData);
      
    } catch (error) {
      console.error('Error fetching odds from mongo', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

module.exports = router;

