// routes/auth.js
const express = require('express');
const router = express.Router();

router.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ username: req.user.username });
    } else {
        res.status(401).json({ message: 'User not authenticated' });
    }
});

module.exports = router;
