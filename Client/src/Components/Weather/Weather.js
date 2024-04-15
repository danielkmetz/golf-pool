import React, {useEffect, useState} from 'react';
import { Container } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchTournamentInfo, 
    selectTournamentInfo,
    fetchWeather,
    selectWeather,
    selectCity,
    selectState,
} from '../../Features/TournamentInfoSlice';
//import { getFullName } from '../../Utils/stateConversion';
import axios from 'axios';

function Weather() {
    const dispatch = useDispatch();
    const tournamentInfo = useSelector(selectTournamentInfo);
    const weather = useSelector(selectWeather);
    const city = useSelector(selectCity);
    const state = useSelector(selectState);
    
    useEffect(() => {
        dispatch(fetchTournamentInfo());
    }, [dispatch]);

    console.log(city)
    console.log(state);

    useEffect(() => {
        if (city && state) {
            dispatch(fetchWeather(city, state))
        }
    }, [city, state, dispatch])

    console.log(weather);
    return (
        <Container>
            <div></div>
        </Container>
    )
};

export default Weather;

