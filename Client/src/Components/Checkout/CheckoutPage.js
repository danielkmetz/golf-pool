import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { jwtDecode } from "jwt-decode";
import { selectPaymentStatus } from "../../Features/paymentStatusSlice";
import { useSelector } from "react-redux";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_51P3g6jLRiEE4G9kBSFBZRSeapJuC6EVHMBq9Yb1oAIDnuSqmOqFCMzB6HakaKBNMd3E5ofmPRPAG3n6B0ncDEOx500I1ZRRefR");

export default function CheckoutPage({onClose}) {
  const [username, setUsername] = useState(null);
  const [showCheckout, setShowCheckout] = useState(true);
  const paymentStatus = useSelector(selectPaymentStatus);
  
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = jwtDecode(token);
      setUsername(decodedToken.username);
    }
  }, [username]);

  

  console.log('payment status from CheckoutPage', paymentStatus)
  return (
    <Elements stripe={stripePromise}>
      {
        !paymentStatus ? (
        <CheckoutForm username={username} onClose={onClose}/>
        ) : null
      }
    </Elements>
  );
}

