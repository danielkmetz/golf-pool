import React, {useState, useEffect} from 'react';
import { Container, Box, Typography, Button, Dialog } from '@mui/material';
import { 
    selectTier1Picks,
    selectTier2Picks,
    selectTier3Picks,
    selectTier4Picks,
 } from '../../Features/myPicksSlice';
import { useSelector, useDispatch } from 'react-redux';
import { removeTier1Golfer, 
    removeTier2Golfer, 
    removeTier3Golfer, 
    removeTier4Golfer } from '../../Features/myPicksSlice';
import SubmissionWindow from './submissionWindow';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import CheckoutPage from '../Checkout/CheckoutPage';
import {  
    selectPaymentStatus,  
    fetchPaymentStatus } from '../../Features/paymentStatusSlice';

function MyPicks() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [showCheckout, setShowCheckout] = useState(true)
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
                    { tier: 'Tier4', golferName: tier4Picks.map(golfer => golfer.player_name || golfer) }
                ];
                // Send the user picks data with the username to the server
                await axios.post(process.env.REACT_APP_API_URL_SAVE, {
                    username: username,
                    userPicks: userPicks,
                });
                setOpen(false)
        } catch (error) {
            console.error('Error saving picks:', error);

            if (error.message) {
                console.error('server responded with', error.response)
            }
        }
    };

    useEffect(() => {
        dispatch(fetchPaymentStatus(username))
    }, [username, handleSubmission, dispatch])

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    }

    const handleCloseCheckout = () => {
        setShowCheckout(false)
    }

    function tier1Removal(golfer) {
        dispatch(removeTier1Golfer(golfer))
    }
    function tier2Removal(golfer) {
        dispatch(removeTier2Golfer(golfer))
    }
    function tier3Removal(golfer) {
        dispatch(removeTier3Golfer(golfer))
    }
    function tier4Removal(golfer) {
        dispatch(removeTier4Golfer(golfer))
    }
    console.log('payment status from myPicks', paymentStatus)
    return (
        <Container className="my-picks"
            sx={{ marginTop: "2rem", border: "2px solid grey", padding: "1rem" }}
        >
                    <Container sx={{ display: "flex", justifyContent: "center" }}>
                        <Typography variant="h5" sx={{ marginRight: "1rem" }}>My Picks</Typography>
                        <Button variant="contained" onClick={handleClickOpen} disabled={isSubmitDisabled}>SUBMIT</Button>
                        <SubmissionWindow isOpen={open} handleSubmission={handleSubmission}>
                            <Typography sx={{ textAlign: "center" }}>
                                Your picks have been saved to your profile
                            </Typography>
                            <Typography sx={{ textAlign: "center" }}>Goodluck!</Typography>
                        </SubmissionWindow>
                    </Container>
                    {/* Render checkout page as a popup */}
                    {!paymentStatus && showCheckout ? (
                    <Dialog open={open} maxWidth="md" fullWidth>
                        <CheckoutPage handleSubmission={handleSubmission} onClose={handleCloseCheckout}/>
                    </Dialog>
                    ) : null }
                    <Box className="picks-by-tier" sx={{ marginTop: "1rem", marginTop: "2rem" }}>
                        <Typography variant="caption" sx={{ display: 'flex' }}>Tier 1:</Typography>
                        {tier1Picks.map((golfer, index) => (
                            <Container key={index}
                                sx={{ display: 'flex', alignItems: 'center', marginTop: "1rem" }}
                            >
                                <Typography variant="body1"
                                    sx={{ flexGrow: 1 }}>{golfer.player_name || golfer}</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => tier1Removal(golfer)}
                                >-</Button>
                            </Container>
                        ))}
                    </Box>
                    <Box className="picks-by-tier" sx={{ marginTop: "1rem", marginTop: "2rem" }}>
                        <Typography variant="caption" sx={{ display: 'flex' }}>Tier 2:</Typography>
                        {tier2Picks.map((golfer, index) => (
                            <Container key={index}
                                sx={{ display: 'flex', alignItems: 'center', marginTop: "1rem" }}
                            >
                                <Typography variant="body1"
                                    sx={{ flexGrow: 1 }}>{golfer.player_name || golfer}</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => tier2Removal(golfer)}
                                >-</Button>
                            </Container>
                        ))}
                    </Box>
                    <Box className="picks-by-tier" sx={{ marginTop: "1rem", marginTop: "2rem" }}>
                        <Typography variant="caption" sx={{ display: 'flex' }}>Tier 3:</Typography>
                        {tier3Picks.map((golfer, index) => (
                            <Container key={index}
                                sx={{ display: 'flex', alignItems: 'center', marginTop: "1rem" }}
                            >
                                <Typography variant="body1"
                                    sx={{ flexGrow: 1 }}>{golfer.player_name || golfer}</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => tier3Removal(golfer)}
                                >-</Button>
                            </Container>
                        ))}
                    </Box>
                    <Box className="picks-by-tier" sx={{ marginTop: "1rem", marginTop: "2rem" }}>
                        <Typography variant="caption" sx={{ display: 'flex' }}>Tier 4:</Typography>
                        {tier4Picks.map((golfer, index) => (
                            <Container key={index}
                                sx={{ display: 'flex', alignItems: 'center', marginTop: "1rem" }}
                            >
                                <Typography variant="body1"
                                    sx={{ flexGrow: 1 }}>{golfer.player_name || golfer}</Typography>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => tier4Removal(golfer)}
                                >-</Button>
                            </Container>
                        ))}
                    </Box>
        </Container>
    )
};

export default MyPicks;

