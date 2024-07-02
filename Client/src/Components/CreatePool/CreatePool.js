import React, { useEffect, } from 'react';
import { Container, useMediaQuery, Box } from '@mui/material';
import { selectUsername, fetchEmail, selectEmail } from '../../Features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import SingleWeek from './SingleWeek';
import SalaryCap from './SalaryCap';

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
        <Container sx={{dispaly: 'flex', flexDirection: 'row'}}>
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: isSmallScreen ? 'column' : 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start' 
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
            </Box>
        </Container>
    );
}

export default CreatePool;
