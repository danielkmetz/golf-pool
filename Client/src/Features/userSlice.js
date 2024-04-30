import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

export const fetchEmail = createAsyncThunk(
    'user/fetchEmail',
    async (username) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/email/${username}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user email');
        }
        const data = await response.json();
        return data.email;
    }
);

export const fetchProfilePic = createAsyncThunk(
    'users/fetchProfilePic',
    async (username) => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile-pics/${username}`, {
            responseType: 'arrayBuffer',
        });
        return response.data;
    }
);

export const uploadProfilePic = createAsyncThunk(
    'users/uploadProfilePic',
    async ({ file, username }, { rejectWithValue, dispatch }) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('username', username);

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/profile-pics`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue('Error uploading profile picture. Please try again.');
        }
    }
);


const userSlice = createSlice({
    name: 'users',
    initialState: {
        email: '',
        profilePic: null,
    },
    reducers: {
        setUserPhoto: (state, action) => {
            state.profilePic = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmail.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchEmail.fulfilled, (state, action) => {
                state.email = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchEmail.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchProfilePic.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProfilePic.fulfilled, (state, action) => {
                state.profilePic = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchProfilePic.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(uploadProfilePic.pending, (state) => {
                state.status = "loading";
            })
            .addCase(uploadProfilePic.fulfilled, (state, action) => {
                state.profilePic = action.payload;
                state.status = "succeeded";
            })
            .addCase(uploadProfilePic.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            });
    },
});

export default userSlice.reducer;

export const selectEmail = (state) => state.users.email;
export const selectProfilePic = (state) => state.users.profilePic;

export const {setUserPhoto} = userSlice.actions;
