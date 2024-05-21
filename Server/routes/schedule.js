const express = require('express');
const router = express.Router();
const ScheduleModel = require('../models/schedule');

router.get('/', async (req, res) => {
    try {
        const schedule = await ScheduleModel.find();
        res.status(200).send(schedule);

    } catch (error) {
        console.error('Error fetching schedule', error)
    }
})

module.exports = router;