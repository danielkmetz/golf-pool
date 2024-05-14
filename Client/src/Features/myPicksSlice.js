import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

export const fetchUserPicks = createAsyncThunk(
    'myPicks/fetchUserPicks',
    async (username) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/userpicks/${username}`);
            //console.log(response)
            if (!response.ok) {
                throw new Error('Failed to fetch user picks');
            }
            const data = await response.json();
            //console.log(data)
            const userPicks = data.userPicks.map(pick => pick);
            return userPicks;
        } catch (error) {
            console.error('Error fetching picks:', error);
            throw error
        }
    }
);

export const deleteUserPicks = createAsyncThunk(
    'myPicks/deleteUserPicks',
    async ({username}) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/userpicks/delete-user-picks/${username}`);
            alert('Your picks have been deleted');
        } catch (error) {
            console.error('Error deleting user picks:', error);
            alert("error deleteing user picks");
        }
    }
)

export const fetchTotalPicks = createAsyncThunk(
    'myPicks/fetchTotalPicks',
    async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/userpicks/`);
            //console.log(response)
            if (!response.ok) {
                throw new Error('Failed to fetch user picks');
            }
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Error fetching picks:', error);
            throw error
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
            if ([...state.tier1Picks].length >= 3) {
                return;
            }
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
            if ([...state.tier2Picks].length >= 2) {
                return;
            }
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
            if ([...state.tier3Picks].length >= 2) {
                return;
            }
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
            if ([...state.tier4Picks].length >= 1) {
                return;
            }
            const exists = state.tier4Picks.some(
                golfer => golfer === action.payload);

            if (!exists) {
                state.tier4Picks = [...state.tier4Picks, action.payload]
            } else {
                return state.tier4Picks;
            }
        },
        removeTier4Golfer: (state, action) => {
            state.tier4Picks = state.tier4Picks.filter(golfer => golfer !== action.payload)
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
        }

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserPicks.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUserPicks.fulfilled, (state, action) => {
                //console.log(action.payload)
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
                //console.log(action.payload)
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
                console.log(action.payload)
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
} = myPicksSlice.actions

