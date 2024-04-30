import React, { useState, useEffect } from 'react';
import { Container, Box, Grid, CircularProgress } from '@mui/material';
import Tier1 from './Tier1';
import MyPicks from './myPicks';

function Golfers() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false); // Set loading to false after data is 'fetched'
        }, 1000); // 2000 ms delay to mimic fetch delay

        return () => clearTimeout(timer); // Clean up the timer
    }, []);

    return (
        <Container>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={6}>
                        <Tier1 />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <MyPicks />
                    </Grid>
                </Grid>
            )}
        </Container>
    );
}

export default Golfers;
