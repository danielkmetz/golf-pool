import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { selectPaymentStatus } from "../../Features/paymentStatusSlice";
import { selectUsername } from "../../Features/userSlice";
import { useSelector } from "react-redux";
// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const key = process.env.REACT_APP_STRIPE_PUBLIC_KEY_TEST

const stripePromise = loadStripe(key);

export default function CheckoutPage({onClose}) {
  const username = useSelector(selectUsername);
  const paymentStatus = useSelector(selectPaymentStatus);
  
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

