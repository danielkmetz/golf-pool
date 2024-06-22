import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';


export const sendUserPositionMap = createAsyncThunk(
    "pastResults/sendUserPositionMap",
    async ({ username, results }, thunkAPI) => {
      try {
        // Make a POST request to the pastResults endpoint with necessary data using Axios
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/past-results/save`, { username, results });
  
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
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/past-results/fetch/${username}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const pastResultsSlice = createSlice({
    name: 'pastResults',
    initialState: {
        pastResults: [],
        status: 'idle',
        error: null,
    },
    reducers: {

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
                state.status = 'loading';
            })
            .addCase(fetchPastResults.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.pastResults = action.payload;
            })
            .addCase(fetchPastResults.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default pastResultsSlice.reducer;

export const selectPastResults = (state) => state.pastResults.pastResults;

