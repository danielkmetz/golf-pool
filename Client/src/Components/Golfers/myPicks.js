import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Dialog, Card, Modal} from '@mui/material';
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
import { fetchEmail, selectEmail, selectUsername } from '../../Features/userSlice';
import CheckoutPage from '../Checkout/CheckoutPage';
import { selectPaymentStatus, fetchPaymentStatus, } from '../../Features/paymentStatusSlice';
import { addGolferToAvailable, selectOddsResults } from '../../Features/bettingOddsSlice';
import { addInitialBalance, selectUserPoolData, selectInitialBalance } from '../../Features/poolsSlice';
import { getAccountBalance, selectUserBalance } from '../../Features/balanceSlice';
import { withdrawBalance } from '../../Features/balanceSlice';

function MyPicks() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const email = useSelector(selectEmail);
  const [goodluck, setGoodluck] = useState(false);
  const [playableBalance, setPlayableBalance] = useState(false);
  const username = useSelector(selectUsername);
  const [showCheckout, setShowCheckout] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  
  const tier1Picks = useSelector(selectTier1Picks);
  const tier2Picks = useSelector(selectTier2Picks);
  const tier3Picks = useSelector(selectTier3Picks);
  const tier4Picks = useSelector(selectTier4Picks);
  const oddsResults = useSelector(selectOddsResults);
  const paymentStatus = useSelector(selectPaymentStatus);
  const poolInfo = useSelector(selectUserPoolData);
  const balance = useSelector(selectInitialBalance);
  const accountBalance = useSelector(selectUserBalance);
  
  const userAccountBalance = accountBalance?.balance
  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const format = poolInfo?.format;
  const buyIn = poolInfo?.buyIn;

  useEffect(() => {
    if (username) {
      dispatch(fetchEmail(username));
    }
  }, [username, dispatch])

  useEffect(() => {
    dispatch(getAccountBalance({username, email}))
  }, [dispatch, username, email])
  
  useEffect(() => {
    if (userAccountBalance > buyIn) {
      setPlayableBalance(true);
    }
  }, [userAccountBalance, buyIn])
  
  const totalPicksLength = tier1Picks.length + tier2Picks.length + tier3Picks.length + tier4Picks.length;

  let isSubmitDisabled;
  if (format === "Salary Cap" || format === "Multi-Week Salary Cap") {
    isSubmitDisabled = currentDay >= 4 || currentDay === 0 || balance > 0;
  } else {
    isSubmitDisabled = currentDay >= 4 || currentDay === 0 || totalPicksLength < 8;
  }
  
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

  const handleUseBalance = () => {
    setShowBalanceModal(false);
    handleSubmission();
    dispatch(withdrawBalance({username, email, adjustment: -buyIn}))
    setGoodluck(true);
  };
  
  const handleDeclineBalance = () => {
    setShowBalanceModal(false);
    setOpen(true);
  };

  const handleSubmitButtonClick = () => {
    if (playableBalance) {
      setShowBalanceModal(true);
    } else {
      setOpen(true);
      setGoodluck(true);
    }
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
  console.log(playableBalance);
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
            onClick={handleSubmitButtonClick} 
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
        {/* Render balance modal */}
        <Modal 
          open={showBalanceModal} 
          onClose={() => setShowBalanceModal(false)}
          disableScrollLock
          sx={{display: 'flex', }}
          >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              m: 'auto',
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" component="h2">
              Use your account balance to pay for the buy in?
            </Typography>
            <Box mt={2} sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUseBalance}
                sx={{
                  backgroundColor: 'green',
                    '&:hover': {
                    backgroundColor: 'lightGreen',
                  }
                }}
                >
                Yes
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={handleDeclineBalance}
                sx={{
                  backgroundColor: '#222',
                      '&:hover': {
                    backgroundColor: 'gray',
                  }
                }}
                >
                No
              </Button>
            </Box>
          </Box>
        </Modal>
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
