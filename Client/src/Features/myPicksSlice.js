import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  });

export const fetchUserPicks = createAsyncThunk(
    'myPicks/fetchUserPicks',
    async ({ username, poolName }, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/userpicks/${username}/${poolName}`);
            
            if (response.status !== 200) {
                return rejectWithValue('Failed to fetch user picks');
            }
            
            return response.data.userPicks || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'An unknown error occurred');
        }
    }
);

export const deleteUserPicks = createAsyncThunk(
    'myPicks/deleteUserPicks',
    async ({username, poolName}) => {
        try {
            const response = await apiClient.delete(`/userpicks/delete-user-picks/${username}/${poolName}`);
            alert('Your picks have been deleted');
            return response.data;
        } catch (error) {
            console.error('Error deleting user picks:', error);
            alert("error deleteing user picks");
        }
    }
)

export const deleteAllUserPicks = createAsyncThunk(
    'myPicks/deleteAllUserPicks',
    async (username) => {
        try {
            const response = await apiClient.delete(`/userpicks/delete-all-picks/${username}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user picks:', error);
        }
    }
)

export const fetchTotalPicks = createAsyncThunk(
    'myPicks/fetchTotalPicks',
    async (poolName) => {  // Accept poolName as an argument
        try {
            const response = await apiClient.get(`/userpicks`, {
                params: {
                    poolName: poolName
                }
            });
            return response.data;  // Return data from the axios response
            
        } catch (error) {
            console.error('Error fetching picks:', error);
            throw error;
        }
    }
);

export const deleteAllPoolPicks = createAsyncThunk(
    'userPicks/deleteUsersPicks',
    async (userPools, { rejectWithValue }) => {
      try {
        const response = await apiClient.delete(`/userpicks/delete-users-picks`, {
          data: { userPools }  // Pass the userPools array in the request body
        });
        return response.data;  // Return the response data if successful
      } catch (error) {
        console.error('Error deleting user picks:', error);
        // Return a rejected value with the error message
        return rejectWithValue(error.response?.data?.message || 'Failed to delete user picks');
      }
    }
);

export const myPicksSlice = createSlice({
    name: 'myPicks',
    initialState: {
        tier1Picks: [],
        tier2Picks: [],
        tier3Picks: [],
        tier4Picks: [],
        allPicks: [],
        totalPicks: [],
    },
    reducers: {
        addTier1Golfer: (state, action) => {
            const exists = state.tier1Picks.some(
                golfer => golfer === action.payload);

            if (!exists) {
                state.tier1Picks = [...state.tier1Picks, action.payload]
            } else {
                return state.tier1Picks;
            }
        },
        removeTier1Golfer: (state, action) => {
            state.tier1Picks = state.tier1Picks.filter(golfer => golfer !== action.payload)
        },
        addTier2Golfer: (state, action) => {
            const exists = state.tier2Picks.some(
                golfer => golfer === action.payload);

            if (!exists) {
                state.tier2Picks = [...state.tier2Picks, action.payload]
            } else {
                return state.tier2Picks;
            }
        },
        removeTier2Golfer: (state, action) => {
            state.tier2Picks = state.tier2Picks.filter(golfer => golfer !== action.payload)
        },
        addTier3Golfer: (state, action) => {
            const exists = state.tier3Picks.some(
                golfer => golfer === action.payload);

            if (!exists) {
                state.tier3Picks = [...state.tier3Picks, action.payload]
            } else {
                return state.tier3Picks;
            }
        },
        removeTier3Golfer: (state, action) => {
            state.tier3Picks = state.tier3Picks.filter(golfer => golfer !== action.payload)
        },
        addTier4Golfer: (state, action) => {
            const exists = state.tier4Picks.some(
                golfer => golfer === action.payload);

            if (!exists) {
                state.tier4Picks = [...state.tier4Picks, action.payload]
            } else {
                return state.tier4Picks;
            }
        },
        removeTier4Golfer: (state, action) => {
            state.tier4Picks = state.tier4Picks.filter(
                golfer => golfer !== action.payload)
        },
        setTier1Picks: (state, action) => {
            state.tier1Picks = action.payload;
        },
        setTier2Picks: (state, action) => {
            state.tier2Picks = action.payload;
        },
        setTier3Picks: (state, action) => {
            state.tier3Picks = action.payload;
        },
        setTier4Picks: (state, action) => {
            state.tier4Picks = action.payload;
        },
        resetTier1Picks: (state, action) => {
            state.tier1Picks = [];
        },
        resetTier2Picks: (state, action) => {
            state.tier2Picks = [];
        },
        resetTier3Picks: (state, action) => {
            state.tier3Picks = [];
        },
        resetTier4Picks: (state, action) => {
            state.tier4Picks = [];
        },
        resetAllPicks: (state, action) => {
            state.allPicks = [];
        },
        setAllPicks: (state, action) => {
            state.allPicks = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserPicks.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUserPicks.fulfilled, (state, action) => {
                state.allPicks = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchUserPicks.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchTotalPicks.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTotalPicks.fulfilled, (state, action) => {
                state.totalPicks = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchTotalPicks.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(deleteUserPicks.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteUserPicks.fulfilled, (state, action) => {
                state.status = "succeeded";
            })
            .addCase(deleteUserPicks.rejected, (state, action) => {
                state.error = action.error.message;
                state.status = "failed";
            })
    }
});

export default myPicksSlice.reducer;

export const selectTier1Picks = (state) => state.myPicks.tier1Picks;
export const selectTier2Picks = (state) => state.myPicks.tier2Picks;
export const selectTier3Picks = (state) => state.myPicks.tier3Picks;
export const selectTier4Picks = (state) => state.myPicks.tier4Picks;
export const selectAllPicks = (state) => state.myPicks.allPicks;
export const selectTotalPicks = (state) => state.myPicks.totalPicks

export const {
    addTier1Golfer,
    removeTier1Golfer,
    addTier2Golfer,
    removeTier2Golfer,
    addTier3Golfer,
    removeTier3Golfer,
    addTier4Golfer,
    removeTier4Golfer,
    setTier1Picks,
    setTier2Picks,
    setTier3Picks,
    setTier4Picks,
    resetTier1Picks,
    resetTier2Picks,
    resetTier3Picks,
    resetTier4Picks,
    resetAllPicks,
    setAllPicks,
} = myPicksSlice.actions

