import React from 'react';
import { Container, Box, Grid } from '@mui/material';
import Tier1 from './Tier1';
import MyPicks from './myPicks';

function Golfers() {
    return (
        <Container>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <Tier1 />
                </Grid>
                <Grid item xs={12} md={6}>
                    <MyPicks />
                </Grid>
            </Grid>
        </Container>
    )
}

export default Golfers;
