const express = require('express');
const router = express.Router();
const OddsModel = require('../models/golferOdds');

router.post('/', async (req, res) => {
    try {
        const oddsData = req.body;

        const newOdds = OddsModel(oddsData);
        await newOdds.save();

        res.status(201).send('Odds saved');
    } catch (error) {
        res.status(500).send('Error saving odds');
    }
})

router.get('/', async (req, res) => {
    try {
      // Make a GET request to the external API to fetch odds data
      const odds = OddsModel.find();
  
      // Send the fetched odds data as a response
      res.status(200).json(odds);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching odds data');
    }
  });

module.exports = router;