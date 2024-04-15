import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';


export const fetchWeather = createAsyncThunk(
    'weather/fetchWeather',
    async (city, state) => {
        const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}%20${state}?unitGroup=metric&key=PXP7ULFB9CU8EGNUCZ9ZA5QX4&contentType=json` 
        const response = await axios.get(weatherUrl)
        console.log(response)
        return response.data
    }
);

const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        weatherResults: [],
        status: "idle",
        error: null,
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeather.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchWeather.fulfilled, (state, action) => {
                state.weatherResults = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchWeather.rejected, (state, action) => {
                state.error = action.error.message;
                state.status = "failed";
            })

    },
})

export default weatherSlice.reducer;

export const selectWeather = (state) => state.weather.weatherResults;

