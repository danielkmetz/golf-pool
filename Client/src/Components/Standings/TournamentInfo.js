import React, {useEffect} from 'react';
import { Container, Typography } from '@mui/material';
import { fetchTournamentInfo, 
    selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { useDispatch, useSelector } from 'react-redux';

function TournamentInfo() {
    const dispatch = useDispatch();
    const tournamentInfo = useSelector(selectTournamentInfo);

    console.log(tournamentInfo)
    
    useEffect(() => {
        dispatch(fetchTournamentInfo());
    }, [dispatch]);

    return (
        <Container sx={{marginTop: "2rem"}}>
            <Typography variant="h4">This Week's Tournmament</Typography>
            <Typography variant="h6">{tournamentInfo?.Name}</Typography>
            <Typography variant="h6">Venue: {tournamentInfo?.Club}</Typography>
            <Typography variant="caption">Par: {tournamentInfo?.Par}</Typography>
        </Container>
    )
}

export default TournamentInfo;