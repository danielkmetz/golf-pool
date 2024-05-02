import React from 'react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const url = `${process.env.REACT_APP_API_URL}/odds` 
const params = {
    method: 'GET',
}

export const fetchOdds = createAsyncThunk(
    'bettingOdds/fetchOdds',
    async () => {
        const response = await fetch(url, params)
        const json = await response.json();
        const odds = json.odds.map(i => i).sort((a, b) => b.draftkings - a.draftkings);
        
        //console.log(odds);
        return odds
    }
);


export const bettingOddsSlice = createSlice({
    name: 'bettingOdds',
    initialState: {
        oddsResults: [],
        tier1Results: [],
        tier2Results: [],
        tier3Results: [],
        tier4Results: [],
        error: null,
        status: "idle",
    },
    reducers: {
        setTier1Results: (state) => {
            const tier1 = Math.floor((state.oddsResults.length) * .20);
            const tier1Slice = state.oddsResults.slice(0, tier1);
            state.tier1Results = tier1Slice;
        },
        setTier2Results: (state) => {
            const tier1 = Math.floor((state.oddsResults.length) * .20);
            const tier2 = Math.floor((state.oddsResults.length) * .25);
            const tier2Slice = state.oddsResults.slice(tier1, (tier1 + 1) + tier2);
            state.tier2Results = tier2Slice;
        },
        setTier3Results: (state) => {
            const tier1 = Math.floor((state.oddsResults.length) * .20);
            const tier2 = Math.floor((state.oddsResults.length) * .25);
            const tier3 = Math.floor((state.oddsResults.length) * .25);
            const tier3Slice = state.oddsResults.slice((tier1 + tier2 + 1), (tier1 + tier2 + 1) + tier3);
            state.tier3Results = tier3Slice;
        },
        setTier4Results: (state) => {
            const tier1 = Math.floor((state.oddsResults.length) * .20);
            const tier2 = Math.floor((state.oddsResults.length) * .25);
            const tier3 = Math.floor((state.oddsResults.length) * .25);
            const tier4 = Math.floor((state.oddsResults.length) * .30);
            const end = Math.floor(state.oddsResults.length + 1)
            const tier4Slice = state.oddsResults.slice((tier1 + tier2 + tier3 + 1), end);
            state.tier4Results = tier4Slice;
        },
        filterGolferFromTier: (state, action) => {
            const { tier, golferName } = action.payload;
            console.log(golferName)
            switch (tier) {
              case 'Tier1':
                state.tier1Results = state.tier1Results.filter(golfer => golfer.player_name !== golferName);
                break;
              case 'Tier2':
                state.tier2Results = state.tier2Results.filter(golfer => golfer.player_name !== golferName);
                break;
              case 'Tier3':
                state.tier3Results = state.tier3Results.filter(golfer => golfer.player_name !== golferName);
                break;
              case 'Tier4':
                state.tier4Results = state.tier4Results.filter(golfer => golfer.player_name !== golferName);
                break;
              default:
                break;
            }
          },
          addGolferToAvailable: (state, action) => {
            const { tier, player_name, draftkings } = action.payload;
            switch (tier) {
              case 1:
                state.tier1Results.push({player_name, draftkings});
                state.tier1Results.sort((a, b) => b.draftkings - a.draftkings);
                break;
              case 'Tier2':
                state.tier2Results.push(player_name);
                state.tier2Results.sort((a, b) => b.draftkings - a.draftkings);
                break;
              case 'Tier3':
                state.tier3Results.push(player_name);
                state.tier3Results.sort((a, b) => b.draftkings - a.draftkings);
                break;
              case 'Tier4':
                state.tier4Results.push(player_name);
                state.tier4Results.sort((a, b) => b.draftkings - a.draftkings);
                break;
              default:
                break;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOdds.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchOdds.fulfilled, (state, action) => {
                state.oddsResults = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchOdds.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
    },
});

export default bettingOddsSlice.reducer;

export const selectOddsResults = (state) => state.bettingOdds.oddsResults;
export const selectTier1Results = (state) => state.bettingOdds.tier1Results;
export const selectTier2Results = (state) => state.bettingOdds.tier2Results;
export const selectTier3Results = (state) => state.bettingOdds.tier3Results;
export const selectTier4Results = (state) => state.bettingOdds.tier4Results;
export const selectStatus = (state) => state.bettingOdds.status === "loading";
export const selectError = (state) => state.bettingOdds.error;

export const {
    setTier1Results, 
    setTier2Results, 
    setTier3Results, 
    setTier4Results,
    filterGolferFromTier,
    addGolferToAvailable,
} = bettingOddsSlice.actions;

