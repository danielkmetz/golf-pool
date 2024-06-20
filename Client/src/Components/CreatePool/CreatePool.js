import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, useMediaQuery } from '@mui/material';
import { selectUsername, fetchEmail, selectEmail } from '../../Features/userSlice';
import { fetchPoolUsers, fetchPoolName } from '../../Features/poolsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';

function CreatePool() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail);

    const [poolName, setPoolName] = useState('');
    const [maxUsers, setMaxUsers] = useState(25);
    const [firstPayout, setFirstPayout] = useState(0.7);
    const [secondPayout, setSecondPayout] = useState(0.2);
    const [thirdPayout, setThirdPayout] = useState(0.1);
    const [buyIn, setBuyIn] = useState(30);
    const [error, setError] = useState('');
    const admin = username;

    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    useEffect(() => {
        if (username) {
            dispatch(fetchEmail(username));
        }
    }, [dispatch, username]);

    const handleFirstPayoutChange = (value) => {
        setFirstPayout(value);
        if (value === 1) {
            setSecondPayout(0);
            setThirdPayout(0);
        }
    };

    const handleCreatePool = async () => {
        if (!poolName.trim()) {
            setError('Pool name is required.');
            return;
        }

        const totalPayout = (firstPayout || 0) + (secondPayout || 0) + (thirdPayout || 0);
        const epsilon = 0.000001; // Tolerance for floating-point comparison

        console.log(totalPayout);
        console.log(firstPayout);
        console.log(secondPayout);
        console.log(thirdPayout);

        if (Math.abs(totalPayout - 1) > epsilon) {
            setError('The total payout percentages must equal 100%.');
            return;
        }

        const poolData = {
            admin,
            email,
            poolName,
            maxUsers: maxUsers === "No Max" ? null : maxUsers,
            buyIn: buyIn,
            payouts: [{ first: firstPayout, second: secondPayout, third: thirdPayout }],
            users: [{ username: admin, email }], // Include the creator in the users array
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/create-pool`, poolData);
            console.log('Pool created successfully:', response.data);
            setError('');
            await dispatch(fetchPoolUsers(poolName));
            await dispatch(fetchPoolName(admin));
            navigate('/Standings');
        } catch (error) {
            console.error('Error creating pool:', error);
            if (error.response && error.response.data) {
                setError(error.response.data.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    return (
        <Container sx={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ border: '2px solid black', padding: '2rem', borderRadius: '8px', width: isSmallScreen ? '100%' : '50%' }}>
                <Typography variant="h5" sx={{ fontFamily: 'Rock Salt' }}>
                    Create your single week pool
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic', marginTop: '50px' }}>
                    For entertainment purposes only
                </Typography>
                <Typography variant="caption"
                    sx={{ textAlign: 'left', display: 'block', whiteSpace: 'normal', fontStyle: 'italic', maxWidth: '600px', marginTop: '.5rem' }}
                >
                    Create a pool for this week's PGA tournament.
                    Players pick 8 golfers with their 4 lowest daily scores counting towards
                    their final tournament total. Golfers that are cut count as +10 saturday and Sunday.
                </Typography>
                {error && (
                    <Typography color="error" sx={{ marginTop: '1rem' }}>
                        {error}
                    </Typography>
                )}
                <Box sx={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column' }}>
                    <Typography><b>Email</b></Typography>
                    <Typography variant="caption" sx={{ marginBottom: '0.5rem' }}>
                        (this email will be marked as the admin)
                    </Typography>
                    <TextField
                        style={{ width: '100%' }}
                        value={email}
                        placeholder="Enter your email address"
                        InputProps={{
                            readOnly: true,
                            sx: { color: 'gray' }
                        }}
                    />
                    <Typography sx={{ marginTop: '.75rem' }}><b>Username</b></Typography>
                    <TextField
                        style={{ width: '100%' }}
                        value={username}
                        placeholder=""
                        InputProps={{
                            readOnly: true,
                            sx: { color: 'gray' }
                        }}
                    />
                    <Typography sx={{ marginTop: '.75rem' }}><b>Pool Name</b></Typography>
                    <TextField
                        style={{ width: '100%' }}
                        placeholder="Name your pool"
                        value={poolName}
                        onChange={(e) => setPoolName(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '1.5rem' }}>
                        <FormControl sx={{ width: '50%', marginRight: '10px' }}>
                            <InputLabel id="max-users-label">Max Users</InputLabel>
                            <Select
                                labelId="max-users-label"
                                value={maxUsers}
                                onChange={(e) => setMaxUsers(e.target.value)}
                                label="Max Users"
                                sx={{ width: '100%' }} // Set the width of the Select component to 100% within the FormControl
                            >
                                <MenuItem value="No Max">No Max</MenuItem>
                                {[20, 25, 30, 35, 40, 50].map((num) => (
                                    <MenuItem key={num} value={num}>{num}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ width: '50%' }}>
                            <InputLabel id="buy-in-label">Buy-In</InputLabel>
                            <Select
                                labelId="buy-in-label"
                                value={buyIn}
                                onChange={(e) => setBuyIn(e.target.value)}
                                label="Buy-In"
                                sx={{ width: '100%' }} // Set the width of the Select component to 100% within the FormControl
                            >
                                <MenuItem value={10}>$10</MenuItem>
                                <MenuItem value={20}>$20</MenuItem>
                                <MenuItem value={30}>$30</MenuItem>
                                {/* Add more options as needed */}
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ marginTop: '1rem' }}>
                        <Typography><b>Payouts</b></Typography>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Choose what percentage of the pot 1st 2nd and 3rd receive</Typography>
                        <Box>
                            <FormControl sx={{ width: '25%', marginTop: '.75rem' }}>
                                <InputLabel id="1st-place-payout-label">1st</InputLabel>
                                <Select
                                    labelId='1st-place-payout-label'
                                    value={firstPayout}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleFirstPayoutChange(value);
                                    }}
                                    label='first-place-payout'
                                    sx={{}}
                                >
                                    <MenuItem value={1}>100%</MenuItem>
                                    <MenuItem value={0.75}>75%</MenuItem>
                                    <MenuItem value={0.70}>70%</MenuItem>
                                    <MenuItem value={0.65}>65%</MenuItem>
                                </Select>
                            </FormControl>
                            {firstPayout === 1 ? null :
                                <>
                                    <FormControl sx={{ width: '25%', marginTop: '.75rem', marginLeft: '2rem' }}>
                                        <InputLabel id="2nd-place-payout-label">2nd</InputLabel>
                                        <Select
                                            labelId='2nd-place-payout-label'
                                            value={secondPayout}
                                            onChange={(e) => setSecondPayout(e.target.value)}
                                            label='second-place-payout'
                                            sx={{}}
                                        >
                                            <MenuItem value={0.2}>20%</MenuItem>
                                            <MenuItem value={0.25}>25%</MenuItem>
                                            <MenuItem value={0.3}>30%</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{ width: '25%', marginTop: '.75rem', marginLeft: '2rem' }}>
                                        <InputLabel id="3rd-place-payout-label">3rd</InputLabel>
                                        <Select
                                            labelId='3rd-place-payout-label'
                                            value={thirdPayout}
                                            onChange={(e) => setThirdPayout(e.target.value)}
                                            label='third-place-payout'
                                            sx={{}}
                                        >
                                            <MenuItem value={0.1}>10%</MenuItem>
                                            <MenuItem value={0.05}>5%</MenuItem>
                                            <MenuItem value={0}>0%</MenuItem>
                                        </Select>
                                    </FormControl>
                                </>
                            }
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        sx={{ marginTop: '1rem', backgroundColor: '#004d40', color: 'white', '&:hover': { backgroundColor: '#00332e' } }}
                        onClick={handleCreatePool}
                    >
                        Create Pool
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default CreatePool;
