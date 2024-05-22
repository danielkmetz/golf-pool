import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users`);
            //console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching users', error)
        }
    }
);

export const updateUsername = createAsyncThunk(
    'users/updateUsername',
    async ({ username, newUsername, token }, { dispatch }) => {
      try {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/users/${username}`,
          {
            newUsername: newUsername,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        //dispatch(userSlice.actions.setUsername(newUsername));
        console.log(response.data)
        localStorage.setItem('token', response.data.token)
        return response.data;
      } catch (error) {
        // Handle errors
        console.error('Error updating username:', error);
        throw error; // Rethrow the error to be caught by the caller
      }
    }
  );

export const updateUsernameMyPicks = createAsyncThunk(
    'users/updateUsernameMyPicks',
    async ({ username, newUsername}) => {
        try {
            const response = axios.put(
                `${process.env.REACT_APP_API_URL}/userpicks/update-username/${username}`, {
                    newUsername: newUsername,
                })
            
            return response.data;
        } catch (error) {

        }
    }
)


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
);

export const fetchUsersWithPicks = createAsyncThunk(
    'users/fetchUsersWithPicks',
    async (users , { rejectWithValue }) => {
        try {
            const promises = users.map(user => 
                axios.get(`${process.env.REACT_APP_API_URL}/userpicks/${user.username}`)
                    .then(response => response.data)
                    .catch(error => {
                        console.error(`Error fetching picks for ${user.username}:`, error);
                        return null; // Handle error for individual request
                    })
            );
            
            const activeUsers = await Promise.all(promises);
            // Filter out null values if any request failed
            return activeUsers.filter(user => user !== null);
        } catch (error) {
            return rejectWithValue('Error fetching user picks');
        }
    }
);

export const fetchProfilePics = createAsyncThunk(
    'users/fetchProfilePics',
    async (profilePicData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/profile-pics/fetch-all`,
                { profilePicData },
                {
                    headers: {
                        'Content-Type': 'application/json', // Specify the Content-Type header
                        // You can add other headers here if needed
                    },
                }
            );
            return response.data.profilePics;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        email: '',
        profilePic: null,
        username: '',
        users: [],
        activeUsers: [],
        profilePics: {},
    },
    reducers: {
        setUserPhoto: (state, action) => {
            state.profilePic = action.payload;
        },
        setUsername: (state, action) => {
            state.username = action.payload;
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
            .addCase(fetchUsersWithPicks.fulfilled, (state, action) => {
                state.activeUsers = action.payload;
            })
            .addCase(fetchUsersWithPicks.rejected, (state, action) => {
                console.error(action.payload);
            })
            .addCase(fetchProfilePics.fulfilled, (state, action) => {
                state.profilePics = action.payload;
            })
            .addCase(fetchProfilePics.rejected, (state, action) => {
                console.error(action.payload);
            })
    },
});

export default userSlice.reducer;

export const selectEmail = (state) => state.users.email;
export const selectProfilePic = (state) => state.users.profilePic;
export const selectProfilePics = (state) => state.users.profilePics;
export const selectUsername = (state) => state.users.username;
export const selectUsers = (state) => state.users.users;
export const selectActiveUsers = (state) => state.users.activeUsers;

export const {setUserPhoto, setUsername} = userSlice.actions;
