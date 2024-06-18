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
                    marginLeft: '1rem',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '0.7rem', 
                        md: '0.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                <b>1st:</b> ${firstPlacePayout}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '1rem',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '.7rem', 
                        md: '.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                <b>2nd:</b> ${secondPlacePayout}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '1rem',
                    fontSize: {
                        xs: '.7rem', // larger on smaller screens
                        sm: '.7rem', 
                        md: '.7rem', // smaller on medium and larger screens
                        lg: '0.6rem',
                        xl: '0.6rem'
                    }
                }}
            >
                <b>3rd: </b>${thirdPlacePayout}
            </Typography>
            </Card>
        </Container>
    );
}

export default Payouts;
