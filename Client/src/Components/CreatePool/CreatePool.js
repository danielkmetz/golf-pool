import React, { useEffect } from 'react';
import { Paper, Typography, Box, Accordion, AccordionSummary, AccordionDetails, useMediaQuery } from '@mui/material';
import { selectUsername, fetchEmail, selectEmail, selectLoggedIn, fetchUsername } from '../../Features/userSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import SingleWeek from './SingleWeek';
import SalaryCap from './SalaryCap';
import MultiWeek from './MultiWeek';
import MultiWeekSalary from './MultiWeekSalary';
import SingleDay from './SingleDay';

function CreatePool() {
    const dispatch = useDispatch();
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail);
    const isLoggedIn = useSelector(selectLoggedIn);
    const admin = username;

    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    useEffect(() => {
        dispatch(fetchUsername());
    }, [dispatch, isLoggedIn])

    useEffect(() => {
        if (username) {
            dispatch(fetchEmail(username));
        }
    }, [dispatch, username]); 
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Paper 
                    sx={{
                        width: '45%',
                        backgroundColor: 'lightgray',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                    }}
                >
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
                        }}
                    >
                        Choose a Format
                    </Typography>
                </Paper>
            </Box>          
            <Box 
                sx={{
                    mt: '1.5rem',
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '@media (max-width: 600px)': {
                        width: '90%'
                    },
                }}>
                <Accordion sx={{ mb: '1rem', width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{py: '.75rem'}}>
                        <Typography variant="h5">Single Week</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <SingleWeek
                            email={email}
                            username={username}
                            admin={admin}
                            isSmallScreen={isSmallScreen}
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ mb: '1rem', width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{py: '.75rem'}}>
                        <Typography variant="h5">Salary Cap</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <SalaryCap
                            email={email}
                            username={username}
                            admin={admin}
                            isSmallScreen={isSmallScreen}
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ mb: '1rem', width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{py: '.75rem'}}>
                        <Typography variant="h5">Multi-Week</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MultiWeek
                            email={email}
                            username={username}
                            admin={admin}
                            isSmallScreen={isSmallScreen}
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ width: '100%', mb: "1rem" }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{py: '.75rem'}}>
                        <Typography variant="h5">Multi-Week Salary Cap</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <MultiWeekSalary
                            email={email}
                            username={username}
                            admin={admin}
                            isSmallScreen={isSmallScreen}
                        />
                    </AccordionDetails>
                </Accordion>

                <Accordion sx={{ width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{py: '.75rem'}}>
                        <Typography variant="h5">Single Round Best 4</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <SingleDay
                            email={email}
                            username={username}
                            admin={admin}
                            isSmallScreen={isSmallScreen}
                        />
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Box>
    );
}

export default CreatePool;
