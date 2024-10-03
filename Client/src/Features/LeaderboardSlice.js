import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const params = {
	method: 'GET',
    'Access-Control-Allow-Origin': '*',
};

export const fetchLeaderboard = createAsyncThunk(
    'leaderboard/fetchLeaderboard',
    async () => {
        const url = `${process.env.REACT_APP_API_URL}/leaderboard`;
        const response = await fetch(url, params);
        const json = await response.json();
        return json.field.map(i => i);
    }
);

export const fetchRound1 = createAsyncThunk(
    'leaderboard/fetchRound1',
    async () => {
        const liveUrl = `https://feeds.datagolf.com/preds/live-tournament-stats?&round=1&${process.env.REACT_APP_DATA_GOLF_KEY}`;
        const response = await fetch(liveUrl, params);
        const json = await response.json();
        return json.live_stats;
    }
);

export const fetchLiveModel = createAsyncThunk(
    'leaderboard/fetchLiveModel',
    async () => {
        const url = `${process.env.REACT_APP_API_URL}/liveResults`;
        const response = await fetch(url, params);
        const json = await response.json()
        return json.data
    }
)


export const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState: {
        results: [],
        round1: [],
        liveResults: [],
        error: null,
        status: "idle",
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaderboard.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchLeaderboard.fulfilled, (state, action) => {
                state.results = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchLeaderboard.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchRound1.fulfilled, (state, action) => {
                state.round1 = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchRound1.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchRound1.pending, (state, action) => {
                state.status = "loading";
            })
            .addCase(fetchLiveModel.fulfilled, (state, action) => {
                state.liveResults = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchLiveModel.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchLiveModel.pending, (state, action) => {
                state.status = "loading";
            })
    },
});

export default leaderboardSlice.reducer;
export const selectResults = (state) => state.leaderboard.results;
export const selectStatus = (state) => state.leaderboard.status === "loading";
export const selectError = (state) => state.leaderboard.error;
export const selectLiveResults = (state) => state.leaderboard.liveResults;
export const selectRoundData = (roundNumber) => (state) => {
    switch (roundNumber) {
        case 1:
            return state.leaderboard.round1;
        case 2:
            return state.leaderboard.round2;
        case 3:
            return state.leaderboard.round3;
        case 4:
            return state.leaderboard.round4;
        default:
            return [];
    }
};

