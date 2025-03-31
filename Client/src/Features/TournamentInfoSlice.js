import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getThursdayDate } from "../actions";
import axios from "axios";

const fetchWeatherData = async (lat, long) => {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_KEY}&q=${lat},${long}&days=1&aqi=no&alerts=no`;
    const response = await fetch(url);
    const json = await response.json();
    return json.forecast.forecastday[0].hour;
  };

  export const fetchTournamentInfo = createAsyncThunk(
    'tournamentInfo/fetchTournamentInfo',
    async (_, { dispatch, getState }) => {
      const state = getState();
      const cachedData = state.tournamentInfo.info;
  
      if (cachedData.length > 0) {
        return cachedData;
      }
  
      const scheduleUrl = `${process.env.REACT_APP_API_URL}/schedule`;
  
      try {
        const response = await fetch(scheduleUrl);
        const tournaments = await response.json();
  
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const thursdayDate = getThursdayDate(currentDay, currentDate);
  
        const thursdayTournament = tournaments.find((tournament) => {
          const tournamentDatePart = tournament.Starts.split('T')[0];
          return tournamentDatePart === thursdayDate;
        });
  
        if (thursdayTournament) {
          dispatch(tournamentInfoSlice.actions.setCity(thursdayTournament.City));
          dispatch(tournamentInfoSlice.actions.setState(thursdayTournament.State));
          dispatch(tournamentInfoSlice.actions.setCountry(thursdayTournament.Country));
        }
  
        return thursdayTournament;
      } catch (error) {
        throw error;
      }
    }
  );
    
  export const fetchGeoCode = createAsyncThunk(
    'tournamentInfo/fetchGeoCode',
    async ({ city, state, country }, { dispatch, getState }) => {
      const url = `https://api.api-ninjas.com/v1/geocoding?city=${city}&state=${state}&country=${country}`;
      const params = {
        method: 'GET',
        headers: { 'X-Api-Key': process.env.REACT_APP_GEOLOCA_KEY }
      };
      const response = await fetch(url, params);
      const json = await response.json();
      
      dispatch(tournamentInfoSlice.actions.setLatitude(json[0].latitude));
      dispatch(tournamentInfoSlice.actions.setLongitude(json[0].longitude));

      return json[0];
    }
  );
  
  export const fetchWeather = createAsyncThunk(
    'weather/fetchWeather',
    async ({ lat, long }, { dispatch }) => {
      const cacheKey = 'weatherCache';
      const cachedData = JSON.parse(localStorage.getItem(cacheKey));
      
      if (cachedData && (Date.now() - cachedData.timestamp) < 1 * 60 * 60 * 1000) {
        return cachedData.data;
      }
      
      const data = await fetchWeatherData(lat, long);

      const timestampedData = { data, timestamp: Date.now() };
      localStorage.setItem(cacheKey, JSON.stringify(timestampedData));
      
      return data;
    }
  );

export const fetchTournaments = createAsyncThunk(
    'tournamentInfo/fetchTournmaments',
    async () => {
        const scheduleUrl = `${process.env.REACT_APP_API_URL}/schedule`;
        const response = await axios.get(scheduleUrl);
        return response.data;
    }
);


const tournamentInfoSlice = createSlice({
    name: 'tournamentInfo',
    initialState: {
        info: [],
        weatherInfo: [],
        geoCodeInfo: [],
        city: '',
        state: '',
        country: '',
        latitude: null,
        longitude: null,
        tournaments: [],
    },
    reducers: {
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setState: (state, action) => {
            state.state = action.payload;
        },
        setCountry: (state, action) => {
            state.country = action.payload;
        },
        setLatitude: (state, action) => {
            state.latitude = action.payload;
        },
        setLongitude: (state, action) => {
            state.longitude = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTournamentInfo.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTournamentInfo.fulfilled, (state, action) => {
                state.info = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchTournamentInfo.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchWeather.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchWeather.fulfilled, (state, action) => {
                state.weatherInfo = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchWeather.rejected, (state, action) => {
                state.error = action.error.message;
                state.status = "failed";
            })
            .addCase(fetchGeoCode.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchGeoCode.fulfilled, (state, action) => {
                state.geoCodeInfo = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchGeoCode.rejected, (state, action) => {
                state.error = action.error.message;
                state.status = "failed";
            })
            .addCase(fetchTournaments.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTournaments.fulfilled, (state, action) => {
                state.tournaments = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchTournaments.rejected, (state, action) => {
                state.error = action.error.message;
                state.status = "failed";
            })

    },
})

export default tournamentInfoSlice.reducer;

export const selectTournamentInfo = (state) => state.tournamentInfo.info;
export const selectWeather = (state) => state.tournamentInfo.weatherInfo;
export const selectCity = (state) => state.tournamentInfo.city;
export const selectState = (state) => state.tournamentInfo.state;
export const selectLong = (state) => state.tournamentInfo.longitude;
export const selectLat = (state) => state.tournamentInfo.latitude;
export const selectCountry = (state) => state.tournamentInfo.country;
export const selectGeoCode = (state) => state.tournamentInfo.geoCodeInfo;
export const selectTournaments = (state) => state.tournamentInfo.tournaments;


