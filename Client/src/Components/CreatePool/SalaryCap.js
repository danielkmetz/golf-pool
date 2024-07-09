import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { fetchPoolUsers, fetchPoolName } from '../../Features/poolsSlice';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';

const CustomSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: 'green',
      '&:hover': {
        backgroundColor: 'rgba(0, 100, 0, 0.08)',
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: 'DarkGreen',
    },
  }));

function SalaryCap({ username, admin, email, isSmallScreen }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [poolName, setPoolName] = useState('');
    const [format, setFormat] = useState('Salary Cap');
    const [maxUsers, setMaxUsers] = useState(25);
    const [firstPayout, setFirstPayout] = useState(0.7);
    const [secondPayout, setSecondPayout] = useState(0.2);
    const [thirdPayout, setThirdPayout] = useState(0.1);
    const [buyIn, setBuyIn] = useState(30);
    const [error, setError] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');

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

        if (Math.abs(totalPayout - 1) > epsilon) {
            setError('The total payout percentages must equal 100%.');
            return;
        }

        const poolData = {
            admin,
            email,
            poolName,
            format,
            maxUsers: maxUsers === "No Max" ? null : maxUsers,
            buyIn: buyIn,
            payouts: [{ first: firstPayout, second: secondPayout, third: thirdPayout }],
            users: [{ username: admin, email }],
            isPrivate,
            password: isPrivate ? password : undefined,
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
        <Box 
            sx={{ 
                border: '2px solid black',
                padding: '1rem',
                borderRadius: '8px', 
                }}
            >
                <Typography variant="h5" sx={{ fontFamily: 'Rock Salt' }}>
                    Single Week Salary Cap
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic', }}>
                    For entertainment purposes only
                </Typography>
                <Typography variant="caption"
                    sx={{ textAlign: 'left', display: 'block', whiteSpace: 'normal', fontStyle: 'italic', maxWidth: '600px', marginTop: '.5rem' }}
                >
                    Users start out with 100 credits and assemble their team of golfers according to prices attached to
                    each tier. User's will have varying team sizes depending on how they deploy their credits.
                    Every golfer score counts instead of just the best 4.
                </Typography>
                {error && (
                    <Typography color="error" sx={{ marginTop: '1rem' }}>
                        {error}
                    </Typography>
                )}
                <Box sx={{ marginTop: '.5rem', display: 'flex', flexDirection: 'column' }}>
                    <FormControlLabel
                        control={
                            <CustomSwitch
                                checked={isPrivate}
                                onChange={() => setIsPrivate(!isPrivate)}
                                name="privateSwitch"
                            />
                        }
                        label={isPrivate ? "Private Pool" : "Public Pool"}
                    />
                    {isPrivate && (
                    <TextField
                        style={{ width: '100%' }}
                        placeholder="Enter pool password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ marginTop: '1rem' }}
                    />
                    )}
                    <Typography sx={{ marginTop: '.75rem' }}><b>Username</b></Typography>
                    <Typography variant="caption" sx={{ marginBottom: '0.5rem', height: '1rem' }}>
                        (this username will be marked as the admin)
                    </Typography>
                    <TextField
                        style={{ width: '100%', height: '3rem' }}
                        value={username}
                        placeholder=""
                        InputProps={{
                            readOnly: true,
                            sx: { color: 'gray' }
                        }}
                    />
                    <Typography sx={{ marginTop: '.75rem', height: '1.5rem' }}><b>Pool Name</b></Typography>
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
                            >
                                <MenuItem value={10}>$10</MenuItem>
                                <MenuItem value={20}>$20</MenuItem>
                                <MenuItem value={30}>$30</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ marginTop: '.5rem' }}>
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
                                    sx={{
                                        '@media (max-width: 600px)': {
                                            fontSize: '11px'
                                        },
                                    }}
                                >
                                    <MenuItem value={1}>100%</MenuItem>
                                    <MenuItem value={.8}>80%</MenuItem>
                                    <MenuItem value={0.75}>75%</MenuItem>
                                    <MenuItem value={0.70}>70%</MenuItem>
                                    <MenuItem value={0.65}>65%</MenuItem>
                                    <MenuItem value={.60}>60%</MenuItem>
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
                                            sx={{
                                                '@media (max-width: 600px)': {
                                                    fontSize: '11px'
                                                },
                                            }}
                                        >
                                            <MenuItem value={0.3}>30%</MenuItem>
                                            <MenuItem value={0.25}>25%</MenuItem>
                                            <MenuItem value={0.2}>20%</MenuItem>
                                            <MenuItem value={0.15}>15%</MenuItem>
                                            <MenuItem value={0.1}>10%</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl sx={{ width: '25%', marginTop: '.75rem', marginLeft: '2rem' }}>
                                        <InputLabel id="3rd-place-payout-label">3rd</InputLabel>
                                        <Select
                                            labelId='3rd-place-payout-label'
                                            value={thirdPayout}
                                            onChange={(e) => setThirdPayout(e.target.value)}
                                            label='third-place-payout'
                                            sx={{
                                                '@media (max-width: 600px)': {
                                                    fontSize: '11px'
                                                },
                                            }}
                                        >
                                            <MenuItem value={0.1}>10%</MenuItem>
                                            <MenuItem value={0.05}>5%</MenuItem>
                                        </Select>
                                    </FormControl>
                                </>
                            }
                        </Box>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleCreatePool} 
                        sx={{ 
                            marginTop: '1rem', 
                            backgroundColor: '#004d40', 
                            color: 'white', 
                            '&:hover': { backgroundColor: '#00332e' } }}
                    >
                        Create Pool
                    </Button>
                </Box>
            </Box>
        );
    }

    export default SalaryCap;
