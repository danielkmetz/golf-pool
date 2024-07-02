import React, { useEffect, } from 'react';
import { Container, useMediaQuery, Paper, Typography, Box } from '@mui/material';
import { selectUsername, fetchEmail, selectEmail } from '../../Features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import SingleWeek from './SingleWeek';
import SalaryCap from './SalaryCap';
import MultiWeek from './MultiWeek';

function CreatePool() {
    const dispatch = useDispatch();
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail);

    const admin = username;

    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    useEffect(() => {
        if (username) {
            dispatch(fetchEmail(username));
        }
    }, [dispatch, username]); 
    
    return (
        <Box sx={{display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
            <Box sx={{display: 'flex', justifyContent: 'center', }}>
                <Paper 
                    sx={{
                        width: '45%',
                        backgroundColor: 'lightgray',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '3.5rem',
                        '@media (max-width: 1400px)': {
                                width: '50%',
                            },
                        '@media (max-width: 800px)': {
                                width: '70%',
                            },
                        '@media (max-width: 600px)': {
                                width: '98%',
                                mt: '.5rem',
                            },
                    }}>
                    <Typography 
                        variant='h4' 
                        sx={{
                            textAlign: 'center',
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 'bold',
                            padding: '.5rem', 
                            borderRadius: '8px',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                            backgroundColor: 'blanchedalmond',
                            width: '80%',
                            height: '1.8rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '@media (max-width: 600px)': {
                                fontSize: '1.6rem'
                            },
                            }}>
                            Choose a Format
                    </Typography>
                </Paper>
            </Box>
            
            <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: isSmallScreen ? 'column' : 'row', 
                        justifyContent: 'center', 
                        alignItems: 'flex-start',
                        margin: isSmallScreen ? '' : '3rem',
                        marginTop: '1rem',
                        '@media (max-width: 600px)': {
                                mb: '2rem',
                            }, 
                    }}
                >
                    <SingleWeek 
                        email={email}
                        username={username}
                        admin={admin}
                        isSmallScreen={isSmallScreen}
                    />
                    <SalaryCap 
                        email={email}
                        username={username}
                        admin={admin}
                        isSmallScreen={isSmallScreen}
                    />
                    {/* <MultiWeek 
                        email={email}
                        username={username}
                        admin={admin}
                        isSmallScreen={isSmallScreen}
                    /> */}
            </Box>
            
        </Box>
    );
}

export default CreatePool;
