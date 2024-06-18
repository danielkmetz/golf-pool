import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Button, TextField } from '@mui/material';
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
    const [error, setError] = useState('');
    const admin = username;

    useEffect(() => {
        if (username) {
            dispatch(fetchEmail(username));
        }
    }, [dispatch, username]);

    const handleCreatePool = async () => {
        const poolData = {
            admin,
            email,
            poolName,
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
        <Container sx={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ border: '2px solid black', padding: '2rem', borderRadius: '8px' }}>
                <Typography variant="h5" sx={{ fontFamily: 'Rock Salt' }}>
                    Create your single week pool
                </Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic', marginTop: '1rem' }}>
                    For entertainment purposes only
                </Typography>
                <Typography variant="caption"
                    sx={{textAlign: 'left', display: 'block', whiteSpace: 'normal', fontStyle: 'italic', maxWidth: '600px', marginTop: '1rem'}}
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
                <Box sx={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <Typography><b>Email</b></Typography>
                    <Typography variant="caption" sx={{ marginBottom: '0.5rem' }}>
                        (this email will be marked as the admin)
                    </Typography>
                    <TextField
                        style={{ width: '500px' }}
                        value={email}
                        placeholder="Enter your email address"
                        InputProps={{ 
                            readOnly: true, 
                            sx: { color: 'gray' }
                        }}
                    />
                    <Typography sx={{ marginTop: '1.5rem' }}><b>Username</b></Typography>
                    <TextField
                        style={{ width: '500px', }}
                        value={username}
                        placeholder=""
                        InputProps={{ 
                            readOnly: true, 
                            sx: { color: 'gray' }
                        }}
                    />
                    <Typography sx={{ marginTop: '1.5rem' }}><b>Pool Name</b></Typography>
                    <TextField
                        style={{ width: '500px' }}
                        placeholder="Name your pool"
                        value={poolName}
                        onChange={(e) => setPoolName(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        sx={{
                            marginTop: '1rem',
                            width: '30%',
                            height: 'auto',
                            backgroundColor: '#222',
                            '&:hover': {
                                backgroundColor: 'DarkGreen',
                            }
                        }}
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
