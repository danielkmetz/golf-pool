const express = require('express');
const router = express.Router();
const stripe = require('stripe')(
    'sk_test_51P3g6jLRiEE4G9kBeQVs8jOFhqoyvJaVO92zFQt0mFqTB1kawz2DvdvwWt6NntnDWzZevqsE0aBOGxm4uYmJUTnj008vASRLtj');

router.post('/', async (req, res) => {
  const {email} = req.body
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: 'usd',
    });

    res.send({clientSecret: paymentIntent.client_secret})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
