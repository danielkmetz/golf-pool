import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getThursdayDate } from "../actions";

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
    return (stateAbbreviations[abbreviation]);
  }

export const fetchTournamentInfo = createAsyncThunk(
    'tournamentInfo/fetchTournamentInfo',
    async (_, { dispatch }) => {
        const key = process.env.REACT_APP_SPORTS_DATA_KEY;
        const scheduleUrl = 
        `https://api.sportsdata.io/golf/v2/json/Tournaments/2024?${key}`;
        const response = await fetch(scheduleUrl);
        const tournaments = await response.json();
        
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const thursdayDate = getThursdayDate(currentDay, currentDate);

        // Filter tournaments with purse > 10 million
        const largePurseTournaments = tournaments.filter(tournament => 
            tournament.Purse > 5000000
        );
        
        const thursdayTournament = tournaments.find(tournament => {
            const tournamentDatePart = tournament.StartDate.split('T')[0];
            return tournamentDatePart === thursdayDate;
        });
        console.log(thursdayTournament)

        dispatch(tournamentInfoSlice.actions.setCity((thursdayTournament.City)))
        dispatch(tournamentInfoSlice.actions.setState((thursdayTournament.State)))
        dispatch(tournamentInfoSlice.actions.setCountry((thursdayTournament.Country)))
        
        return thursdayTournament;
    }
)

export const fetchGeoCode = createAsyncThunk(
    'tournamentInfo/fetchGeoCode',
    async ({city, state, country}, { dispatch }) => {
        const url = `https://api.api-ninjas.com/v1/geocoding?city=${city}&state=${state}&country=${country}`
        const params = {
            method: 'GET',
            headers: { 'X-Api-Key': process.env.REACT_APP_GEOLOCA_KEY}
        }
        const response = await fetch(url, params);
        const json = await response.json();
        //console.log(json[0])
        await dispatch(tournamentInfoSlice.actions.setLatitude((json[0].latitude)))
        await dispatch(tournamentInfoSlice.actions.setLongitude((json[0].longitude)));

        return json;
    }
)

export const fetchWeather = createAsyncThunk(
    'weather/fetchWeather',
    async ({lat, long}) => {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.REACT_APP_WEATHER_KEY}&q=${lat},${long}&days=1&aqi=no&alerts=no`;
        const response = await fetch(url);
        const json = await response.json();
        //console.log(json.forecast.forecastday[0].hour)
        return json.forecast.forecastday[0].hour;
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
    },
    reducers: {
        setCity: (state, action) => {
            state.city = action.payload;
        },
        setState: (state, action) => {
            state.state = getFullName(action.payload);
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


