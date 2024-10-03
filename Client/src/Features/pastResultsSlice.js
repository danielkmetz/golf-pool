import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  });

export const sendUserPositionMap = createAsyncThunk(
    "pastResults/sendUserPositionMap",
    async ({ username, results }, thunkAPI) => {
      try {
        // Make a POST request to the pastResults endpoint with necessary data using Axios
        const response = await apiClient.post(`/past-results/save`, { username, results });
  
        // Return the response data
        return response.data;
      } catch (error) {
        // Handle error, such as dispatching an error action
        return thunkAPI.rejectWithValue({ error: error.message });
      }
    }
  );
  
export const fetchPastResults = createAsyncThunk(
    'pastResults/fetchPastResults',
    async (username, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/past-results/fetch/${username}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchWeeklyResults = createAsyncThunk(
    'pastResults/fetchWeeklyResults',
    async ({ tournamentName, usernames, year }, { rejectWithValue }) => {
        const apiUrl = `/past-results/weekly`
        const usernamesArray = usernames.map(user => user.username);
        try {
            const response = await apiClient.post(apiUrl, { tournamentName, usernames: usernamesArray, year });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const duplicateRecordsCheck = createAsyncThunk(
    'pastResults/duplicateRecordsCheck',
    async ({ tournamentName, usernames, year }, { rejectWithValue }) => {
        const apiUrl = `/past-results/weekly`
        const usernamesArray = usernames.map(user => user.username);
        try {
            const response = await apiClient.post(apiUrl, { tournamentName, usernames: usernamesArray, year });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserTotalsForTournaments = createAsyncThunk(
    'pastResults/fetchUserTotalsForTournaments',
    async ({ tournaments, usernames }, { rejectWithValue }) => {
        const apiUrl = `/past-results/weekly`;
        const usernamesArray = usernames.map(user => user.username);
        const results = {};

        try {
            for (let tournament of tournaments) {
                const tournamentName = tournament.Name;
                const year = new Date().getFullYear();

                const response = await apiClient.post(apiUrl, { tournamentName, usernames: usernamesArray, year: year });

                response.data.forEach(userResult => {
                    if (!results[userResult.username]) {
                        results[userResult.username] = {
                            username: userResult.username,
                            tournaments: [],
                            totalScore: 0
                        };
                    }

                    const tournamentTotal = userResult.results.reduce((acc, result) => acc + result.scores.Total, 0);
                    results[userResult.username].tournaments.push({ year: year, total: tournamentTotal });
                    results[userResult.username].totalScore += tournamentTotal;
                });
            }

            return Object.values(results);
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteUserPastResults = createAsyncThunk(
    'pastResults/deleteUserPastResults',
    async ({ username }, { rejectWithValue }) => {
        try {
            const deleteUserUrl = `/past-results/delete-user/${username}`;
            const response = await apiClient.delete(deleteUserUrl);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user past results');
        }
    }
);

const pastResultsSlice = createSlice({
    name: 'pastResults',
    initialState: {
        pastResults: [],
        weeklyResults: [],
        duplicates: [],
        totals: [],
        status: 'idle',
        error: null,
        pastResultsStatus: 'idle',
    },
    reducers: {
        resetPastResults: (state, action) => {
            state.pastResults = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendUserPositionMap.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sendUserPositionMap.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Optionally add the new results to the existing data
                state.pastResults.push(action.payload);
            })
            .addCase(sendUserPositionMap.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchPastResults.pending, (state) => {
                state.pastResultsStatus = 'loading';
            })
            .addCase(fetchPastResults.fulfilled, (state, action) => {
                state.pastResultsStatus = 'succeeded';
                state.pastResults = action.payload;
            })
            .addCase(fetchPastResults.rejected, (state, action) => {
                state.pastResultsStatus = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchWeeklyResults.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.weeklyResults = action.payload;
            })
            .addCase(fetchWeeklyResults.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchUserTotalsForTournaments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.totals = action.payload;
            })
            .addCase(fetchUserTotalsForTournaments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(duplicateRecordsCheck.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.duplicates = action.payload;
            })
            .addCase(duplicateRecordsCheck.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteUserPastResults.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUserPastResults.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pastResults = [];
                state.weeklyResults = [];
                state.totals = [];
            })
            .addCase(deleteUserPastResults.rejected, (state, action) => {
                state.status = 'failed';
            })
    },
});

export default pastResultsSlice.reducer;

export const {resetPastResults} = pastResultsSlice.actions;

export const selectPastResults = (state) => state.pastResults.pastResults;
export const selectWeeklyResults = (state) => state.pastResults.weeklyResults;
export const selectTotals = (state) => state.pastResults.totals;
export const selectDuplicates = (state) => state.pastResults.duplicates;
export const selectPastResultsStatus = (state) => state.pastResults.pastResultsSatus;
