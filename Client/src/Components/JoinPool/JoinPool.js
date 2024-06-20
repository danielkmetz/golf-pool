import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, List, ListItem, ListItemText, Button } from '@mui/material';
import { fetchPools, selectPools, setPoolName } from '../../Features/poolsSlice';
import { selectUsername } from '../../Features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';

function JoinPool() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const pools = useSelector(selectPools);
    const username = useSelector(selectUsername);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchPools());
    }, [dispatch]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleJoinPool = async (poolName, username) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/create-pool/join`,
                { poolName, username: username });
            
            if (response.status === 200) {
                // Optionally update UI or notify user of success
                dispatch(setPoolName(poolName));
                alert('Successfully joined the pool!');
                navigate('/Standings');
            }
        } catch (error) {
            console.error('Error joining pool:', error);
            alert('Failed to join the pool.');
        }
    };

    const filteredPools = pools.filter(pool =>
        pool.poolName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ marginTop: '1.5rem', fontFamily: 'Rock Salt' }}>
                Available Pools
            </Typography>
            <Typography variant="caption" sx={{ marginTop: '1rem', fontStyle: 'italic' }}>
                Join a random pool or search for yours!
            </Typography>
            <TextField
                sx={{ marginTop: '1rem', width: '60%' }}
                placeholder="Search Pools"
                value={searchQuery}
                onChange={handleSearchChange}
            />
            <Box sx={{
                marginTop: '1.5rem',
                border: '2px solid black',
                padding: '2rem',
                width: '55%',
                height: '490px',
                borderRadius: '8px',
                overflowY: 'auto',
                '@media (max-width: 600px)': {
                    width: '87%'
                },
            }}>
                <List>
                    {filteredPools.map((pool, index) => {
                        const isDisabled = pool.maxUsers !== null && pool.users.length >= pool.maxUsers;
                        return (
                            <ListItem 
                                key={index} 
                                sx={{ 
                                    borderBottom: '1px solid black', 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    '@media (max-width: 600px)': {
                                        display: 'flex',
                                        flexDirection: 'column',
                                    },
                                }}
                            >
                                <ListItemText 
                                    primary={
                                        <Typography variant='h6'><b>{pool.poolName}</b></Typography>
                                    } 
                                    secondary={
                                        <>
                                            <Typography component="span" variant='caption'>
                                                Users: {pool.users.length} / {pool.maxUsers === null ? 'No Max' : pool.maxUsers}
                                            </Typography>
                                            <br />
                                            <Typography component="span" variant='caption'>
                                                Buy-In: ${pool.buyIn}
                                            </Typography>
                                            <br />
                                            <Typography variant='caption'>
                                                Payout Structure: 1st: {pool.payouts[0].first * 100}% / 2nd: {pool.payouts[0].second * 100}% / 3rd: {pool.payouts[0].third * 100}%
                                            </Typography>
                                        </>
                                    }
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {isDisabled && (
                                        <Typography variant="caption" color="error" sx={{ marginLeft: '0.5rem' }}>
                                            Pool has reached max users allowed
                                        </Typography>
                                    )}
                                    <Button 
                                        variant="contained" 
                                        sx={{ 
                                            marginLeft: '1rem',
                                            backgroundColor: '#222',
                                            '&:hover': {
                                                backgroundColor: 'DarkGreen',
                                            }
                                        }}
                                        onClick={() => handleJoinPool(pool.poolName, username)}
                                        disabled={isDisabled}
                                    >
                                        Join
                                    </Button>
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Container>
    );
}

export default JoinPool;
