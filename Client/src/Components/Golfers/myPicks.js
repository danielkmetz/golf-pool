import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Dialog, Card, } from '@mui/material';
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
import { selectUsername } from '../../Features/userSlice';
import CheckoutPage from '../Checkout/CheckoutPage';
import {
  selectPaymentStatus,
  fetchPaymentStatus,
} from '../../Features/paymentStatusSlice';
import { addGolferToAvailable, selectOddsResults } from '../../Features/bettingOddsSlice';
import { addInitialBalance, selectUserPoolData, selectInitialBalance } from '../../Features/poolsSlice';

function MyPicks() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [goodluck, setGoodluck] = useState(false);
  const username = useSelector(selectUsername);
  const [showCheckout, setShowCheckout] = useState(true);
  const tier1Picks = useSelector(selectTier1Picks);
  const tier2Picks = useSelector(selectTier2Picks);
  const tier3Picks = useSelector(selectTier3Picks);
  const tier4Picks = useSelector(selectTier4Picks);
  const oddsResults = useSelector(selectOddsResults);
  const paymentStatus = useSelector(selectPaymentStatus);
  const poolInfo = useSelector(selectUserPoolData);
  const balance = useSelector(selectInitialBalance);
  const currentDate = new Date();
  const currentDay = currentDate.getDay();

  const format = poolInfo.format;

  const totalPicksLength = tier1Picks.length + tier2Picks.length + tier3Picks.length + tier4Picks.length;

  let isSubmitDisabled;
  if (format === "Salary Cap" || format === "Multi-Week Salary Cap") {
    isSubmitDisabled = currentDay >= 4 || currentDay === 0 || balance > 0;
  } else {
    isSubmitDisabled = currentDay >= 4 || currentDay === 0 || totalPicksLength < 8;
  }
  //const isSubmitDisabled = false;

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

  const handleClose = () => {
    setOpen(false);
    setGoodluck(false);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);
  };

  function findOdds(golferName) {
    const golferOdds = oddsResults.find(golfer => golfer.player_name === golferName);
    return golferOdds.draftkings
  }
  
  function tierRemoval(tier, golferName) {
    const odds = findOdds(golferName)
    
    if (format === "Single Week" || format === "Multi-Week") {
      switch (tier) {
        case 1:
          dispatch(removeTier1Golfer(golferName));
          dispatch(addGolferToAvailable({tier: tier, player_name: golferName, draftkings: odds}))
          break;
        case 2:
          dispatch(removeTier2Golfer(golferName));
          dispatch(addGolferToAvailable({tier: 'Tier2', player_name: golferName, draftkings: odds}))
          break;
        case 3:
          dispatch(removeTier3Golfer(golferName));
          dispatch(addGolferToAvailable({tier: 'Tier3', player_name: golferName, draftkings: odds}))
          break;
        case 4:
          dispatch(removeTier4Golfer(golferName));
          dispatch(addGolferToAvailable({tier: 'Tier4', player_name: golferName, draftkings: odds}))
          break;
        default:
          break;
      }
    }
    if (format === "Salary Cap" || format === "Multi-Week Salary Cap") {
      switch (tier) {
        case 1:
          dispatch(removeTier1Golfer(golferName));
          dispatch(addGolferToAvailable({tier: tier, player_name: golferName, draftkings: odds}))
          dispatch(addInitialBalance(25))
          break;
        case 2:
          dispatch(removeTier2Golfer(golferName));
          dispatch(addGolferToAvailable({tier: 'Tier2', player_name: golferName, draftkings: odds}))
          dispatch(addInitialBalance(15))
          break;
        case 3:
          dispatch(removeTier3Golfer(golferName));
          dispatch(addGolferToAvailable({tier: 'Tier3', player_name: golferName, draftkings: odds}))
          dispatch(addInitialBalance(10))
          break;
        case 4:
          dispatch(removeTier4Golfer(golferName));
          dispatch(addGolferToAvailable({tier: 'Tier4', player_name: golferName, draftkings: odds}))
          dispatch(addInitialBalance(5))
          break;
        default:
          break;
      }
    }      
  };

  return (
    <Card className="my-picks" 
      sx={{ 
        marginTop: '2rem', 
        backgroundColor: '#f5f5f5', 
        padding: '1rem', 
        position: 'relative' }}>
        <div 
          style={{ 
            backgroundColor: 'lightgreen', 
            width: '100%', 
            padding: '0.5rem .01rem', 
            marginBottom: '1rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            position: 'absolute', 
            top: 0, 
            left: 0 
        }}
        >
          <Typography variant="h5" style={{ color: 'black', marginLeft: "1rem", fontFamily: 'Rock Salt' }}>
            My Picks
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              if (paymentStatus) {
                handleSubmission();
                setGoodluck(true);
              } else {
                setOpen(true);
                setGoodluck(true);
              }
            }} 
            disabled={isSubmitDisabled} 
            sx={{
              marginRight: "1rem", 
              backgroundColor: 'red',
              '&:hover': {
                backgroundColor: 'darkred',
              }
            }}
          >
            SUBMIT
          </Button>
        </div>
        <Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '3rem' }}>
          <SubmissionWindow isOpen={goodluck} handleClose={handleClose}>
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
        {format === "Salary Cap" || format === "Multi-Week Salary Cap" ? 
          <Card 
            sx={{
              width: '100px',
              backgroundColor: 'white',
              textAlign: 'center',
            }}
          >
           <Typography sx={{padding: '.5px'}}><b>Balance:</b> {balance}</Typography> 
          </Card> : null
        }
        {[tier1Picks, tier2Picks, tier3Picks, tier4Picks].map((tierPicks, index) => (
          <Box key={index} className="picks-by-tier" sx={{ marginTop: '1rem' }}>
            <Typography variant="h7" sx={{textDecoration: 'underline'}}><b>Tier {index + 1}:</b></Typography>
            {tierPicks.map((golfer, golferIndex) => (
              <Box key={golferIndex} sx={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {golfer.player_name || golfer}
                </Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => tierRemoval(index + 1, golfer)}
                  sx={{
                    backgroundColor: '#222',
                    '&:hover': {
                      backgroundColor: 'DarkGreen',
                    }
                  }}  
                >
                  -
                </Button>
              </Box>
            ))}
          </Box>
        ))}
    </Card>
  );
}

export default MyPicks;
