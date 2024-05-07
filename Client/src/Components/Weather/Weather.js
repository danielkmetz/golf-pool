import React, { useEffect } from 'react';
import { Container, Grid, Typography, Card, CardContent } from '@mui/material'; // Assuming you're using Material-UI
import { useDispatch, useSelector } from 'react-redux';
import { 
    fetchTournamentInfo, 
    fetchWeather,
    selectWeather,
    selectCity,
    selectState,
    selectCountry,
    selectLong,
    selectLat,
    fetchGeoCode,
} from '../../Features/TournamentInfoSlice';

import sunny from '../../Resources/sunny.png';
import rainy from '../../Resources/rainy.png';
import cloudy from '../../Resources/cloudy.png';

function Weather() {
    const dispatch = useDispatch();
    const weather = useSelector(selectWeather);
    const city = useSelector(selectCity);
    const state = useSelector(selectState);
    const country = useSelector(selectCountry);
    const long = useSelector(selectLong);
    const lat = useSelector(selectLat);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        dispatch(fetchTournamentInfo());
    }, [dispatch]);

    useEffect(() => {
        if (city && state && country) {
            dispatch(fetchGeoCode({city, state, country}));
        }
    }, [dispatch, city, state, country]);

    // console.log(city);
    // console.log(state);
    // console.log(lat);
    // console.log(long);

    useEffect(() => {
        if (lat && long) {
            dispatch(fetchWeather({lat, long}))
        }
    }, [dispatch, lat, long]);

    // Get the current date and time
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so add 1 and pad with 0 if needed
    const day = String(currentDate.getDate()).padStart(2, '0'); // Pad with 0 if needed
    const hours = String(currentDate.getHours()).padStart(2, '0'); // Pad with 0 if needed

    // Construct the date and time string in "YYYY-MM-DD HH:00" format
    const currentDateTime = `${year}-${month}-${day} ${hours}:00`;

    const filteredForecast = weather.filter((forecast) => {
        const forecastDateTime = new Date(forecast.time).getTime();
        const currentDateTime = new Date().getTime();
      
        // Calculate the timestamp for 6 hours from now
        const sixHoursLater = currentDateTime + (6 * 60 * 60 * 1000); // 6 hours * 60 minutes * 60 seconds * 1000 milliseconds
      
        // Filter the forecast based on timestamps
        return forecastDateTime >= currentDateTime && forecastDateTime <= sixHoursLater;
      });
      
    const getWeatherImage = (weatherDesc) => {
        if (weatherDesc.toLowerCase().includes('sunny')) {
            return sunny;
        } else if (weatherDesc.toLowerCase().includes('rain')) {
            return rainy;
        } else if (weatherDesc.toLowerCase().includes('cloud')) {
            return cloudy;
        } else if (weatherDesc.toLowerCase().includes('overcast')) {
            return cloudy;
        } else if (weatherDesc.toLowerCase().includes('thunder')) {
            return rainy
        } else if (weatherDesc.toLowerCase().includes('mist')) {
            return cloudy;
        }
    };

    const formatTime = (timeString) => {
        const [datePart, timePart] = timeString.split(' '); // Split the date and time parts
        const [hour, minute] = timePart.split(':'); // Split the time into hours and minutes
      
        // Convert hours to 12-hour format and determine am/pm
        let formattedHour = parseInt(hour, 10);
        const amPm = formattedHour >= 12 ? 'pm' : 'am';
        formattedHour = formattedHour % 12 || 12; // Convert 0 to 12 for 12 am/pm
      
        return `${formattedHour} ${amPm}`; // Return formatted time
      };
    
    return (
        <Container sx={{ marginTop: '2rem', padding: '0',}}>
            <Card raised sx={{ backgroundColor: "#222", color: "white"}}>
                <CardContent>
                    <Grid container spacing={.7}>
                    {filteredForecast.map((forecast, index) => (
                        <Grid item key={index} xs={2}>
                        <Typography variant="subtitle2">{formatTime(forecast.time)}</Typography>
                        <img src={getWeatherImage(forecast.condition.text)} alt={forecast.condition.text} style={{ width: '40px', height: '40px', marginBottom: '0.5rem' }} />
                        <Typography variant="body2">{forecast.weatherDesc}</Typography>
                        <Typography variant="body2">{forecast.temp_f}°F</Typography>
                        <Typography variant="body2" sx={{fontSize: "10px"}}>Wind Speed: {forecast.wind_mph} mph</Typography>
                        </Grid>
                    ))}
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    )
};

export default Weather;


