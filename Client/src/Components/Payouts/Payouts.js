import React from 'react';
import { Typography, Card, Box } from '@mui/material';
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
        <Box sx={{ 
            marginBottom: '.5rem', 
            marginTop: '-1.7rem', 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%', 
            }}>
            <Card sx={{
                padding: '.5rem',
                height: '1.2rem',
                backgroundColor: 'lightGray',
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                '@media (min-width: 600px) and (max-width: 1200px)': {
                    fontSize: '10px',
                },
                '@media (max-width: 600px)': {
                    paddingLeft: '',
                    paddingRight: '',
                },
                }}
            >
                <Typography 
                    variant="h7" 
                    sx={{ 
                        fontFamily: 'Rock Salt',
                        fontSize: '10px',
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
                                ml: '.75rem',
                        },
                        '@media (max-width: 600px)': {
                            ml: '.75rem'
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
                                ml: '.75rem',
                        },
                        '@media (max-width: 600px)': {
                            ml: '.75rem'
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
                        fontSize: '10px',
                        '@media (max-width: 600px)': {
                            ml: '.75rem'
                        },
                        '@media (min-width: 600px) and (max-width: 1200px)': {
                                ml: '.75rem',
                            },
                    }}
                >
                    <b>3rd: </b>${thirdPlacePayout}
                </Typography>
            </Card>
        </Box>
    );
}

export default Payouts;
