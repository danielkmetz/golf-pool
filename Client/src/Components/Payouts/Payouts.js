import React from 'react';
import { Container, Typography, Card } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectActiveUsers, } from '../../Features/userSlice';

function Payouts() {
    const activeUsers = useSelector(selectActiveUsers);

    const totalActive = activeUsers.length;
    const firstPlacePayout = Math.floor((totalActive * 30) * 0.6667);
    const secondPlacePayout = Math.floor((totalActive * 30) * 0.25);
    const thirdPlacePayout = Math.floor((totalActive * 30) * 0.084);

    return (
        <Container sx={{ marginBottom: '.5rem', marginTop: '-1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Card sx={{padding: '.5rem'}}>
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
            </Card>
        </Container>
    );
}

export default Payouts;
