import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Dialog, useMediaQuery } from '@mui/material';
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
import { useSelector, useDispatch } from 'react-redux';
import {
  removeTier1Golfer,
  removeTier2Golfer,
  removeTier3Golfer,
  removeTier4Golfer,
} from '../../Features/myPicksSlice';
import SubmissionWindow from './submissionWindow';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CheckoutPage from '../Checkout/CheckoutPage';
import {
  selectPaymentStatus,
  fetchPaymentStatus,
} from '../../Features/paymentStatusSlice';

function MyPicks() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [showCheckout, setShowCheckout] = useState(true);
  const tier1Picks = useSelector(selectTier1Picks);
  const tier2Picks = useSelector(selectTier2Picks);
  const tier3Picks = useSelector(selectTier3Picks);
  const tier4Picks = useSelector(selectTier4Picks);
  const paymentStatus = useSelector(selectPaymentStatus);
  const currentDate = new Date();
  const currentDay = currentDate.getDay();

  const isSubmitDisabled = currentDay >= 4 && currentDay <= 0;

  // fetch username
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken) {
        setUsername(decodedToken.username);
      }
    }
  }, [username]);

  const handleSubmission = async () => {
    try {
      const userPicks = [
        { tier: 'Tier1', golferName: tier1Picks.map(golfer => golfer.player_name || golfer) },
        { tier: 'Tier2', golferName: tier2Picks.map(golfer => golfer.player_name || golfer) },
        { tier: 'Tier3', golferName: tier3Picks.map(golfer => golfer.player_name || golfer) },
        { tier: 'Tier4', golferName: tier4Picks.map(golfer => golfer.player_name || golfer) },
      ];
      // Send the user picks data with the username to the server
      await axios.post(process.env.REACT_APP_API_URL_SAVE, {
        username: username,
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

  useEffect(() => {
    dispatch(fetchPaymentStatus(username));
  }, [username, handleSubmission, dispatch]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  function tierRemoval(tier, golfer) {
    switch (tier) {
      case 1:
        dispatch(removeTier1Golfer(golfer));
        break;
      case 2:
        dispatch(removeTier2Golfer(golfer));
        break;
      case 3:
        dispatch(removeTier3Golfer(golfer));
        break;
      case 4:
        dispatch(removeTier4Golfer(golfer));
        break;
      default:
        break;
    }
  }

  console.log('payment status from myPicks', paymentStatus);
  return (
    <Container className="my-picks" sx={{ marginTop: '2rem', border: '2px solid grey', padding: '1rem', position: 'relative' }}>
      <div style={{ backgroundColor: 'lightblue', width: '100%', padding: '0.5rem .01rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0 }}>
        <Typography variant="h5" style={{ color: 'black', marginLeft: "1rem" }}>My Picks</Typography>
        <Button variant="contained" onClick={handleClickOpen} disabled={isSubmitDisabled} sx={{marginRight: "1rem"}}>
          SUBMIT
        </Button>
      </div>
      <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '3rem' }}>
        <SubmissionWindow isOpen={open} handleSubmission={handleSubmission}>
          <Typography sx={{ textAlign: 'center' }}>Your picks have been saved to your profile</Typography>
          <Typography sx={{ textAlign: 'center' }}>Good luck!</Typography>
        </SubmissionWindow>
      </Container>
      {/* Render checkout page as a popup */}
      {!paymentStatus && showCheckout && (
        <Dialog open={open} maxWidth="md" fullWidth>
          <CheckoutPage handleSubmission={handleSubmission} onClose={handleCloseCheckout} />
        </Dialog>
      )}
      {[tier1Picks, tier2Picks, tier3Picks, tier4Picks].map((tierPicks, index) => (
        <Box key={index} className="picks-by-tier" sx={{ marginTop: '1rem' }}>
          <Typography variant="caption">Tier {index + 1}:</Typography>
          {tierPicks.map((golfer, golferIndex) => (
            <Box key={golferIndex} sx={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {golfer.player_name || golfer}
              </Typography>
              <Button variant="contained" size="small" onClick={() => tierRemoval(index + 1, golfer)}>
                -
              </Button>
            </Box>
          ))}
        </Box>
      ))}
    </Container>
  );
  
}

export default MyPicks;

