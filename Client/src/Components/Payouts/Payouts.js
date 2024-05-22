import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveUsers, fetchUsersWithPicks } from '../../Features/userSlice';

function Payouts() {
    const dispatch = useDispatch();
    const activeUsers = useSelector(selectActiveUsers);

    const totalActive = activeUsers.length;
    const firstPlacePayout = Math.floor((totalActive * 30) * 0.6667);
    const secondPlacePayout = Math.floor((totalActive * 30) * 0.25);
    const thirdPlacePayout = Math.floor((totalActive * 30) * 0.084);

    return (
        <Container sx={{ marginBottom: '1rem', marginTop: '-1rem', display: 'flex', justifyContent: 'center' }}>
            <Typography 
                variant="h7" 
                sx={{ 
                    fontFamily: 'Rock Salt',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '.7rem', 
                        md: '.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                <b>Payouts:</b>
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '2rem',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '0.7rem', 
                        md: '0.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                1st: ${firstPlacePayout}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '2rem',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '.7rem', 
                        md: '.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                2nd: ${secondPlacePayout}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '2rem',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '.7rem', 
                        md: '.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                3rd:  ${thirdPlacePayout}
            </Typography>
        </Container>
    );
}

export default Payouts;
