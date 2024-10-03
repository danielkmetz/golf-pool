import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import './CheckoutForm.css';
import { Typography } from '@mui/material';
import { selectUsername } from '../../Features/userSlice';
import { updatePaymentStatus, selectPaymentStatus } from '../../Features/paymentStatusSlice';
import { selectPoolName, selectUserPoolData } from '../../Features/poolsSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectTier1Picks,
  selectTier2Picks,
  selectTier3Picks,
  selectTier4Picks,
  setTier1Picks,
  setTier2Picks,
  setTier3Picks,
  setTier4Picks,
} from '../../Features/myPicksSlice';

const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
  };
  
  const CheckoutForm = ({onClose}) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const paymentStatus = useSelector(selectPaymentStatus);
    // State for billing details and form visibility
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');
    const username = useSelector(selectUsername);
    const [submitted, setSubmitted] = useState(false)
    const tier1Picks = useSelector(selectTier1Picks);
    const tier2Picks = useSelector(selectTier2Picks);
    const tier3Picks = useSelector(selectTier3Picks);
    const tier4Picks = useSelector(selectTier4Picks);
    const poolInfo = useSelector(selectUserPoolData);
    const poolName = useSelector(selectPoolName);

    const fee = (poolInfo?.buyIn < 30 ? 3 : poolInfo?.buyIn * 0.10);
    const buyIn = (poolInfo?.buyIn || 0) + fee;

    const handleSubmission = async () => {
      try {
        const userPicks = [
          { tier: 'Tier1', golferName: tier1Picks.map(golfer => golfer.player_name || golfer) },
          { tier: 'Tier2', golferName: tier2Picks.map(golfer => golfer.player_name || golfer) },
          { tier: 'Tier3', golferName: tier3Picks.map(golfer => golfer.player_name || golfer) },
          { tier: 'Tier4', golferName: tier4Picks.map(golfer => golfer.player_name || golfer) },
        ];
        // Send the user picks data with the username to the server
        await axios.post(`${process.env.REACT_APP_API_URL}/userpicks/save`, {
          username: username,
          poolName: poolName,
          userPicks: userPicks,
        });
  
        dispatch(setTier1Picks([]));
        dispatch(setTier2Picks([]));
        dispatch(setTier3Picks([]));
        dispatch(setTier4Picks([]));
  
        setOpen(false);
      } catch (error) {
        console.error('Error saving picks:', error);
  
        if (error.message) {
          console.error('server responded with', error.response);
        }
      }
    };  
    
    const handleUpdateStatus = async (username, status) => {
      try {
        await dispatch(updatePaymentStatus({username, poolName}))
        console.log("update successful")
      } catch (error) {
        console.error(error)
      }
    }
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      if (!stripe || !elements) {
        return;
      }
      const cardElement = elements.getElement(CardElement);
  
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/charge`, {
        email: email,
        buyIn: buyIn,
      });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: name,
            email: email,
            phone: phone,
            address: {
              line1: addressLine1,
              city: city,
              state: state,
              postal_code: postalCode,
            },
          },
        },
      });
  
      if (result.error) {
        console.log(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          console.log('Payment successful!');
          await handleUpdateStatus(username, true);
          await handleSubmission();
          onClose();
          setSubmitted(true)
          window.close();
        }
      }
    };
    console.log('payment status Checkout Form', paymentStatus);
    if (submitted) {
      return (
        null
      )
    }
    return (
      <>
          <form onSubmit={handleSubmit}>
            <CardElement options={CARD_ELEMENT_OPTIONS} />
            <div>
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input type="text" placeholder="Address Line 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              <b>Please submit payment to complete picks submission</b>
            </Typography>
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              <b>Please note: Your purchase includes a $3 transaction fee</b>
            </Typography>
            <button type="submit" disabled={!stripe} className="button">
              Pay ${buyIn}
            </button>
          </form>
      </>
    );
  };
  
  export default CheckoutForm;

