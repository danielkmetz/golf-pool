const express = require('express');
const router = express.Router();
const axios = require('axios');

const OddsModel = require('../models/golferOdds');


router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://feeds.datagolf.com/betting-tools/outrights', {
        params: {
          market: 'win',
          odds_format: 'percent',
          key: process.env.REACT_APP_DATA_GOLF_KEY,
        },
      });
      const oddsData = response.data.odds;

      await OddsModel.insertMany(oddsData);

      res.json(oddsData);

    } catch (error) {
        console.error('Error fetching data golf odds', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})

module.exports = router;