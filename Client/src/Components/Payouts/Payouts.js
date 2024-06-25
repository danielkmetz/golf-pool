import React from 'react';
import { Container, Typography, Card } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectActiveUsers, } from '../../Features/userSlice';
import { selectUserPoolData } from '../../Features/poolsSlice';

function Payouts() {
    const activeUsers = useSelector(selectActiveUsers);
    const poolInfo = useSelector(selectUserPoolData);

    const firstPlacePercentage = poolInfo?.payouts?.[0]?.first || 0;
    const secondPlacePercentage = poolInfo?.payouts?.[0]?.second || 0;
    const thirdPlacePercentage = poolInfo?.payouts?.[0]?.third || 0;
    const buyIn = poolInfo?.buyIn || 0;

    const totalActive = activeUsers.length;
    const firstPlacePayout = Math.floor((totalActive * buyIn) * firstPlacePercentage);
    const secondPlacePayout = Math.floor((totalActive * buyIn) * secondPlacePercentage);
    const thirdPlacePayout = Math.floor((totalActive * buyIn) * thirdPlacePercentage);

    return (
        <Container sx={{ marginBottom: '.5rem', marginTop: '-1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Card sx={{
                padding: '.5rem',
                '@media (min-width: 600px) and (max-width: 1200px)': {
                            fontSize: '9px',
                        },
                }}>
            <Typography 
                variant="h7" 
                sx={{ 
                    fontFamily: 'Rock Salt',
                    fontSize: '11px',
                }}
            >
                <b>Payouts:</b>
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '1rem',
                    fontSize: '11px',
                    '@media (min-width: 600px) and (max-width: 1200px)': {
                            fontSize: '9px',
                            ml: '.75rem',
                        },
                }}
            >
                <b>1st:</b> ${firstPlacePayout}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '1rem',
                    fontSize: '11px',
                    '@media (min-width: 600px) and (max-width: 1200px)': {
                            fontSize: '9px',
                            ml: '.75rem',
                        },
                }}
            >
                <b>2nd:</b> ${secondPlacePayout}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    fontFamily: 'Rock Salt', 
                    marginLeft: '1rem',
                    fontSize: '11px',
                    '@media (min-width: 600px) and (max-width: 1200px)': {
                            fontSize: '9px',
                            ml: '.5rem',
                        },
                }}
            >
                <b>3rd: </b>${thirdPlacePayout}
            </Typography>
            </Card>
        </Container>
    );
}

export default Payouts;
