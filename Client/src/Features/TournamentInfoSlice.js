import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getThursdayDate } from "../actions";
import axios from 'axios';

const stateAbbreviations = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };
  
function getFullName(abbreviation) {
    return (stateAbbreviations[abbreviation]).toLowerCase();
  }

export const fetchTournamentInfo = createAsyncThunk(
    'tournamentInfo/fetchTournamentInfo',
    async (_, { dispatch }) => {
        const scheduleUrl = 
        'https://api.sportsdata.io/golf/v2/json/Tournaments/2024?key=8d248137425947d2928a10896592f0b1';
        const response = await fetch(scheduleUrl);
        const tournaments = await response.json();
        
        //console.log(tournaments)
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const thursdayDate = getThursdayDate(currentDay, currentDate);

        const thursdayTournament = tournaments.find((tournament) => {
            const tournamentDatePart = tournament.StartDate.split('T')[0];
            return tournamentDatePart === thursdayDate;
        });
        console.log(thursdayTournament)

        dispatch(tournamentInfoSlice.actions.setCity((thursdayTournament.City)))
        dispatch(tournamentInfoSlice.actions.setState((thursdayTournament.State)))

        return thursdayTournament;
    }
)

export const fetchWeather = createAsyncThunk(
    'weather/fetchWeather',
    async (city) => {
        const key = '7d01763e46af4c01884213609241104';
        const weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city}` 
        const response = await axios.get(weatherUrl)
        console.log(response)
        return response.data.forecast.forecastday
    }
);

const tournamentInfoSlice = createSlice({
    name: 'tournamentInfo',
    initialState: {
        info: [],
        weatherInfo: [],
        city: '',
        state: '',
    },
    reducers: {
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setState: (state, action) => {
            state.state = action.payload;
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

    },
})

export default tournamentInfoSlice.reducer;

export const selectTournamentInfo = (state) => state.tournamentInfo.info;
export const selectWeather = (state) => state.tournamentInfo.weatherInfo;
export const selectCity = (state) => state.tournamentInfo.city;
export const selectState = (state) => state.tournamentInfo.state;

