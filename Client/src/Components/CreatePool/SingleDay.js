import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPoolName } from '../../Features/poolsSlice';
import axios from 'axios';
import { fetchTournaments, selectTournaments } from '../../Features/TournamentInfoSlice';
import { getThursdayDate, formatDate } from '../../actions';
import { styled } from '@mui/material/styles';
import {
    Box,
    Button,
    FormControlLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    InputLabel,
    FormControl,
    Switch,
} from '@mui/material';

const COLORS = {
    primary: '#004d40',
    white: '#ffffff',
    error: '#ff0000',
    border: 'gray',
    background: '#f0f0f0',
};

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

function SingleDay({ username, admin, email }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const schedule = useSelector(selectTournaments);
    
    const [poolSettings, setPoolSettings] = useState({
        tempPoolName: '',
        format: 'Single Round',
        maxUsers: 25,
        firstPayout: 0.7,
        secondPayout: 0.2,
        thirdPayout: 0.1,
        buyIn: 30,
        isPrivate: false,
        password: '',
        round: 'Opening Day',
    });

    const [tournaments, setTournaments] = useState([]);
    const [error, setError] = useState('');

    const getThursdayDate = (currentDay, currentDate) => {
        const daysUntilThursday = (4 - currentDay + 7) % 7;
        const offset = currentDay >= 4 ? 7 : 0;
        const nextThursday = new Date(currentDate);
        nextThursday.setDate(currentDate.getDate() + daysUntilThursday + offset);
        return nextThursday;
    };

    const thursdayDate = useMemo(() => {
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const nextThursday = getThursdayDate(currentDay, currentDate);
        return formatDate(nextThursday);
    }, []);

    useEffect(() => {
        dispatch(fetchTournaments());
    }, [dispatch]);

    useEffect(() => {
        if (schedule.length > 0 && thursdayDate) {
            const index = schedule.findIndex(tournament => {
                const tournamentDate = new Date(tournament.Starts);
                return tournamentDate.toISOString().split('T')[0] === thursdayDate;
            });
            if (index !== -1) {
                const slicedTournaments = schedule.slice(index, index + poolSettings.numTournaments);
                const tournamentsWithWeek = slicedTournaments.map((tournament, i) => ({
                    ...tournament,
                    Week: i + 1
                }));
                setTournaments(tournamentsWithWeek);
            }
        }
    }, [schedule, thursdayDate, poolSettings.numTournaments]);

    const handleChange = (key, value) => {
        setPoolSettings(prevSettings => {
            let updatedSettings = { ...prevSettings, [key]: value };

            if (key === 'firstPayout' && value === 1) {
                updatedSettings.secondPayout = 0;
                updatedSettings.thirdPayout = 0;
            }

            return updatedSettings;
        });
    };

    const validatePayouts = () => {
        const totalPayout = (poolSettings.firstPayout || 0) + (poolSettings.secondPayout || 0) + (poolSettings.thirdPayout || 0);
        const epsilon = 0.000001;
        return Math.abs(totalPayout - 1) <= epsilon;
    };

    const handleCreatePool = async () => {
        if (!poolSettings.tempPoolName.trim()) {
            setError('Pool name is required.');
            return;
        }

        if (!validatePayouts()) {
            setError('The total payout percentages must equal 100%.');
            return;
        }

        const poolData = {
            admin,
            email,
            poolName: poolSettings.tempPoolName,
            format: poolSettings.format,
            maxUsers: poolSettings.maxUsers === "No Max" ? null : poolSettings.maxUsers,
            buyIn: poolSettings.buyIn,
            payouts: [{ first: poolSettings.firstPayout, second: poolSettings.secondPayout, third: poolSettings.thirdPayout }],
            users: [{ username: admin, email }],
            isPrivate: poolSettings.isPrivate,
            password: poolSettings.isPrivate ? poolSettings.password : undefined,
            round: poolSettings.round,
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/create-pool`, poolData);
            if (response.status === 201) {
                dispatch(setPoolName(poolSettings.tempPoolName));
                alert('Successfully created your pool!');
                navigate('/standings');
            } else {
                setError('Failed to create the pool. Please try again.');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    return (
        <Box
            sx={{
                border: '2px solid black',
                padding: '1rem',
                borderRadius: 8,
            }}
        >
            <Typography variant="h5" sx={{ fontFamily: 'Rock Salt' }}>
                Best 4 Scores Single Round
            </Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', marginTop: '50px' }}>
                For entertainment purposes only
            </Typography>
            <Typography 
                sx={{ 
                    textAlign: 'left', 
                    display: 'block', 
                    whiteSpace: 'normal', 
                    fontStyle: 'italic', 
                    maxWidth: '600px', 
                    marginTop: '.5rem'
                    }}
            >
                Create a pool for a specific round in this week's PGA tournament.
                Players pick 8 golfers with their 4 lowest scores counting towards their final total.
            </Typography>
            {error && (
                <Typography sx={{ color: COLORS.error, marginBottom: '1rem' }}>{error}</Typography>
            )}
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                    }}>
                <FormControlLabel
                    control={
                        <CustomSwitch
                            checked={poolSettings.isPrivate}
                            onChange={() => handleChange('isPrivate', !poolSettings.isPrivate)}
                        />
                    }
                    label={poolSettings.isPrivate ? 'Private Pool' : 'Public Pool'}
                />
                <FormControl sx={{ ml: '1rem' }}>
                    <InputLabel id="round-select-label">Round</InputLabel>
                    <Select
                        labelId="round-select-label"
                        value={poolSettings.round}
                        label="Round"
                        onChange={(e) => handleChange('round', e.target.value)}
                        sx={{
                            width: '8rem',
                            height: '2rem',
                            fontSize: '12px'
                        }}
                    >
                        <MenuItem value="Opening Day" sx={{fontSize: '12px'}}>Opening Day</MenuItem>
                        <MenuItem value="Packing Day" sx={{fontSize: '12px'}}>Packing Day</MenuItem>
                        <MenuItem value="Moving Day" sx={{fontSize: '12px'}}>Moving Day</MenuItem>
                        <MenuItem value="Final Round" sx={{fontSize: '12px'}}>Final Round</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {poolSettings.isPrivate && (
                <TextField
                    label="Enter pool password"
                    variant="outlined"
                    fullWidth
                    value={poolSettings.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    sx={{ marginTop: 2, marginBottom: 2 }}
                />
            )}
            <Typography sx={{ marginBottom: 1 }}>
                <strong>Username:</strong> {username}
            </Typography>
            <Typography variant="caption" sx={{ fontStyle: 'italic', marginBottom: 1 }}>
                (This username will be marked as the admin)
            </Typography>
            <TextField
                label="Name your pool"
                variant="outlined"
                fullWidth
                value={poolSettings.tempPoolName}
                onChange={(e) => handleChange('tempPoolName', e.target.value)}
                sx={{ marginBottom: 2, width: "100%" }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <FormControl sx={{ width: '50%', marginRight: '10px' }}>
                    <InputLabel id="max-users-label">Max Users</InputLabel>
                    <Select
                        labelId="max-users-label"
                        value={poolSettings.maxUsers}
                        label="Max Users"
                        onChange={(e) => handleChange('maxUsers', e.target.value)}
                    >
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={35}>35</MenuItem>
                        <MenuItem value={40}>40</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value="No Max">No Max</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ width: '50%' }}>
                    <InputLabel id="buy-in-label">Buy In</InputLabel>
                    <Select
                        labelId="buy-in-label"
                        value={poolSettings.buyIn}
                        label="Buy In"
                        onChange={(e) => handleChange('buyIn', e.target.value)}
                    >
                        <MenuItem value={10}>$10</MenuItem>
                        <MenuItem value={20}>$20</MenuItem>
                        <MenuItem value={30}>$30</MenuItem>
                        <MenuItem value={40}>$40</MenuItem>
                        <MenuItem value={50}>$50</MenuItem>
                        <MenuItem value={60}>$60</MenuItem>
                        <MenuItem value={70}>$70</MenuItem>
                        <MenuItem value={80}>$80</MenuItem>
                        <MenuItem value={90}>$90</MenuItem>
                        <MenuItem value={100}>$100</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ marginTop: '.5rem' }}>
                <Typography gutterBottom>
                    <b>Payouts</b>
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                    Choose what percentage of the pot 1st, 2nd, and 3rd receive
                </Typography>
                <Box >
                    <FormControl sx={{ width: '25%', marginTop: '.75rem' }}>
                        <InputLabel id="first-payout-label">1st</InputLabel>
                        <Select
                            labelId="first-payout-label"
                            value={poolSettings.firstPayout}
                            label="1st"
                            onChange={(e) => handleChange('firstPayout', e.target.value)}
                            sx={{
                                '@media (max-width: 600px)': {
                                    fontSize: '11px'
                                },
                            }}
                        >
                            <MenuItem value={1}>100%</MenuItem>
                            <MenuItem value={0.85}>85%</MenuItem>
                            <MenuItem value={0.8}>80%</MenuItem>
                            <MenuItem value={0.75}>75%</MenuItem>
                            <MenuItem value={0.7}>70%</MenuItem>
                            <MenuItem value={0.65}>65%</MenuItem>
                            <MenuItem value={0.6}>60%</MenuItem>
                            <MenuItem value={0.55}>55%</MenuItem>
                        </Select>
                    </FormControl>
                    {poolSettings.firstPayout < 1 && (
                        <>
                            <FormControl  sx={{ width: '25%', marginTop: '.75rem', marginLeft: '2rem' }}>
                                <InputLabel id="second-payout-label">2nd</InputLabel>
                                <Select
                                    labelId="second-payout-label"
                                    value={poolSettings.secondPayout}
                                    label="2nd"
                                    onChange={(e) => handleChange('secondPayout', e.target.value)}
                                    sx={{
                                        '@media (max-width: 600px)': {
                                            fontSize: '11px'
                                        },
                                    }}
                                >
                                    <MenuItem value={0}>0%</MenuItem>
                                    <MenuItem value={0.15}>15%</MenuItem>
                                    <MenuItem value={0.2}>20%</MenuItem>
                                    <MenuItem value={0.25}>25%</MenuItem>
                                    <MenuItem value={0.3}>30%</MenuItem>
                                    <MenuItem value={0.35}>35%</MenuItem>
                                    <MenuItem value={0.4}>40%</MenuItem>
                                    <MenuItem value={0.45}>45%</MenuItem>
                                    <MenuItem value={0.5}>50%</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl  sx={{ width: '25%', marginTop: '.75rem', marginLeft: '2rem' }}>
                                <InputLabel id="third-payout-label">3rd</InputLabel>
                                <Select
                                    labelId="third-payout-label"
                                    value={poolSettings.thirdPayout}
                                    label="3rd"
                                    onChange={(e) => handleChange('thirdPayout', e.target.value)}
                                    sx={{
                                        '@media (max-width: 600px)': {
                                            fontSize: '11px'
                                        },
                                    }}
                                >
                                    <MenuItem value={0}>0%</MenuItem>
                                    <MenuItem value={0.05}>5%</MenuItem>
                                    <MenuItem value={0.1}>10%</MenuItem>
                                    <MenuItem value={0.15}>15%</MenuItem>
                                    <MenuItem value={0.2}>20%</MenuItem>
                                    <MenuItem value={0.25}>25%</MenuItem>
                                    <MenuItem value={0.3}>30%</MenuItem>
                                    <MenuItem value={0.35}>35%</MenuItem>
                                    <MenuItem value={0.4}>40%</MenuItem>
                                    <MenuItem value={0.45}>45%</MenuItem>
                                    <MenuItem value={0.5}>50%</MenuItem>
                                </Select>
                            </FormControl>
                        </>
                    )}
                </Box>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreatePool}
                    sx={{ 
                        marginTop: '1rem', 
                        backgroundColor: COLORS.primary,
                        width: '100%', 
                        '&:hover': { backgroundColor: '#00332e' },
                    }}
                >
                    Create Pool
                </Button>
            </Box>
        </Box>
    );
}

export default SingleDay;

