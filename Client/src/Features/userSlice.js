import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching users', error)
        }
    }
);

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
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile-pics/${username}`, {
                responseType: 'arrayBuffer',
            });
            return response.data;
        } catch (error) {
            console.error(`${username} does not have a profile picture`)
        }
    }
);

//frontend logic
export const uploadProfilePic = createAsyncThunk(
    'users/uploadProfilePic',
    async ({ image, username }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('username', username);
            console.log(image)
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/profile-pics`, formData, {
                headers: {
                    'accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.8',
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

export const fetchUsername = createAsyncThunk(
    'users/fetchUsername',
    async () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            return decodedToken.username;
        }
    }
)

const userSlice = createSlice({
    name: 'users',
    initialState: {
        email: '',
        profilePic: null,
        username: '',
        users: [],
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
            })
            .addCase(fetchUsername.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUsername.fulfilled, (state, action) => {
                state.username = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchUsername.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchUsers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.users = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
    },
});

export default userSlice.reducer;

export const selectEmail = (state) => state.users.email;
export const selectProfilePic = (state) => state.users.profilePic;
export const selectUsername = (state) => state.users.username;
export const selectUsers = (state) => state.users.users;

export const {setUserPhoto} = userSlice.actions;
