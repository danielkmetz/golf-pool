import React from 'react';
import { Container, Box } from '@mui/material';
import Tier1 from './Tier1';
import MyPicks from './myPicks';


function Golfers() {
    return (
        <Container sx={{display: "flex", justifyContent: "space-around"}}>
            <Tier1/>
            <MyPicks/>
        </Container>
    )
}

export default Golfers;