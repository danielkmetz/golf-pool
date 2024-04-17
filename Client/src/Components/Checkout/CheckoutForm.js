import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';
import './CheckoutForm.css';
import { Typography } from '@mui/material';
import { jwtDecode } from "jwt-decode";
import { updatePaymentStatus, selectPaymentStatus } from '../../Features/paymentStatusSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

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
    const paymentStatus = useSelector(selectPaymentStatus);
    // State for billing details and form visibility
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState(null);
    const [submitted, setSubmitted] = useState(false)
    
    useEffect(() => {
      const token = localStorage.getItem('token');
  
      if (token) {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username);
      }
    }, [username]);

    const handleUpdateStatus = async (username, status) => {
      try {
        await dispatch(updatePaymentStatus({username, status}))
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
  
      const { data } = await axios.post(process.env.REACT_APP_API_URL_PAY, {
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
          handleUpdateStatus(username, true);
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
            <button type="submit" disabled={!stripe} className="button">
              Pay $30
            </button>
          </form>
      </>
    );
  };
  
  export default CheckoutForm;

