const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://feeds.datagolf.com/betting-tools/outrights', {
            params: {
                market: 'win',
                odds_format: 'percent',
                key: process.env.REACT_APP_DATA_GOLF_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching Datagolf data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

module.exports = router;