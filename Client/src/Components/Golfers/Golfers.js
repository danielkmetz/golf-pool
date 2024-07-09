import React, { useState, useEffect } from 'react';
import { Container, Box, Grid, useMediaQuery } from '@mui/material';
import Tier1 from './Tier1';
import MyPicks from './myPicks';
import GolfBallLoading from '../GolfBallLoading/GolfBallLoading';

function Golfers() {
    const [loading, setLoading] = useState(true);
    const isSmallScreen = useMediaQuery('(min-width:860px)');

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000); 

        return () => clearTimeout(timer);
    }, []);

    return (
        <Container>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <GolfBallLoading />
                </Box>
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={6} order={isSmallScreen ? 1 :2}>
                        <Tier1 />
                    </Grid>
                    <Grid item xs={12} md={6} order={isSmallScreen ? 2 : 1}>
                        <MyPicks />
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}

export default Golfers;
