import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  });

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async () => {
        try {
            const response = await apiClient.get(`/users`);
            return response.data;
        } catch (error) {
            console.error('Error fetching users', error)
        }
    }
);

export const updateUsername = createAsyncThunk(
    'users/updateUsername',
    async ({ username, newUsername, token }, { rejectWithValue }) => {
      try {
        const response = await apiClient.put(
          `/users/${username}`,
          { newUsername },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Save the new token in AsyncStorage (ensure this is awaited)
        await localStorage.setItem('token', response.data.token);
  
        // Debugging: Log the new token after storing it
        const updatedToken = await localStorage.getItem('token');
        console.log('Updated token from AsyncStorage:', updatedToken);
  
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 409) {
          // Return a custom error message if the username is taken
          return rejectWithValue('Username already taken. Please choose another one.');
        }
  
        // Log the error for debugging
        console.error('Error updating username:', error);
  
        // Return a generic failure message
        return rejectWithValue('Failed to update username.');
      }
    }
  );

export const updateUsernameEverywhere = createAsyncThunk(
    'users/updateUsernameEverywhere',
    async ({ username, newUsername, email }, { rejectWithValue }) => {
        try {
            const updateRequests = [
                apiClient.put(`/userpicks/update-username/${username}`, { newUsername })
                    .catch(error => {
                        if (error.response && error.response.status === 404) {
                            console.warn(`404 Error on userpicks: ${error.response.data.message}`);
                            return null; // Return null to continue with other requests
                        }
                        throw error;
                    }),
                apiClient.put(`/create-pool/update-username/${username}`, { newUsername })
                    .catch(error => {
                        if (error.response && error.response.status === 404) {
                            console.warn(`404 Error on create-pool: ${error.response.data.message}`);
                            return null; 
                        }
                        throw error;
                    }),
                apiClient.put(`/past-results/update-username/${username}`, { newUsername })
                    .catch(error => {
                        if (error.response && error.response.status === 404) {
                            console.warn(`404 Error on past-results: ${error.response.data.message}`);
                            return null; 
                        }
                        throw error;
                    }),
                apiClient.put(`/chat/update-username/${username}`, { newUsername })
                    .catch(error => {
                        if (error.response && error.response.status === 404) {
                            console.warn(`404 Error on chat: ${error.response.data.message}`);
                            return null; 
                        }
                        throw error;
                    }),
            ];

            const [myPicksResponse, poolResponse, pastResultsResponse, chatsResponse] = await Promise.all(updateRequests);

            return {
                myPicks: myPicksResponse ? myPicksResponse.data : null,
                pool: poolResponse ? poolResponse.data : null,
                pastResults: pastResultsResponse ? pastResultsResponse.data : null,
                chats: chatsResponse ? chatsResponse.data : null,
            };
        } catch (error) {
            console.error('Error updating username across services:', error);
            return rejectWithValue('Failed to update username across all services');
        }
    }
);
    
export const updateUsernameMyPicks = createAsyncThunk(
    'users/updateUsernameMyPicks',
    async ({ username, newUsername}) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/userpicks/update-username/${username}`, {
                    newUsername: newUsername,
                })
            
            return response.data;
        } catch (error) {

        }
    }
)

export const updateUsernamePool = createAsyncThunk(
    'users/updateUsernamePool',
    async ({ username, newUsername}) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/create-pool/update-username/${username}`, {
                    newUsername: newUsername,
                })
            
            return response.data;
        } catch (error) {

        }
    }
)

export const updateUsernamePastResults = createAsyncThunk(
    'users/updateUsernamePastResults',
    async ({ username, newUsername}) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/past-results/update-username/${username}`, {
                    newUsername: newUsername,
                })
            console.log(response.data);
            return response.data;
        } catch (error) {

        }
    }
);

export const updateUsernameChats = createAsyncThunk(
    'users/updateUsernameChats',
    async ({ username, newUsername}) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/chat/update-username/${username}`, {
                    newUsername: newUsername,
                })
            console.log(response.data);
            return response.data;
        } catch (error) {

        }
    }
);

export const fetchEmail = createAsyncThunk(
    'user/fetchEmail',
    async (username, { rejectWithValue }) => {
      try {
        const response = await apiClient.get(`/users/email/${username}`);
        return response.data.email;
      } catch (error) {
        return rejectWithValue('Failed to fetch user email');
      }
    }
  );

export const fetchProfilePic = createAsyncThunk(
    'users/fetchProfilePic',
    async (username) => {
        try {
            const response = await apiClient.get(`/profile-pics/${username}`, {
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
            const response = await apiClient.post(`/profile-pics`, formData, {
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
    async ({ users, poolName }, { rejectWithValue }) => {
        try {
            // Extract usernames from the users array
            const usernames = users.map(user => user.username);

            // Validate input
            if (!Array.isArray(usernames) || usernames.length === 0) {
                return rejectWithValue('Usernames must be a non-empty array');
            }

            if (!poolName) {
                return rejectWithValue('poolName is required');
            }

            // Send a single POST request with usernames and poolName
            const response = await apiClient.post(`/userpicks/users-picks`, {
                usernames,
                poolName
            });

            if (response.status !== 200) {
                return rejectWithValue('Failed to fetch user picks');
            }

            // The response data is an array of userPicks documents
            const userPicksData = response.data;

            // Create a map for quick lookup
            const userPicksMap = {};
            userPicksData.forEach(item => {
                userPicksMap[item.username] = item.userPicks;
            });

            // Construct the final array, excluding users with null picks
            const usersWithPicks = users
                .map(user => ({
                    username: user.username,
                    userPicks: userPicksMap[user.username] // Get user picks
                }))
                .filter(user => user.userPicks !== null && user.userPicks !== undefined); // Filter out null or undefined picks

            return usersWithPicks;
        } catch (error) {
            console.error('Error fetching user picks:', error);
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'An unknown error occurred'
            );
        }
    }
);

export const fetchProfilePics = createAsyncThunk(
    'users/fetchProfilePics',
    async (profilePicData, { rejectWithValue }) => {
      try {
        const response = await apiClient.post(
          `/profile-pics/fetch-all`,
          { profilePicData },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        return response.data.profilePics;
      } catch (error) {
        console.error('[fetchProfilePics] Error occurred:', error); // 🔴 ERROR LOG
        if (error.response) {
          console.error('[fetchProfilePics] Error response data:', error.response.data); // 🔴 RESPONSE ERROR LOG
        }
        return rejectWithValue(error.response?.data || { message: 'Unknown error' });
      }
    }
);
  
export const updateLastReadTimestamp = createAsyncThunk(
    'users/updateLastReadTimestamp', 
    async (username, { dispatch }) => {
        try {
            // Your logic to update the last read timestamp in the backend
            const response = await apiClient.put(`/users/lastReadTimestamp/${username}`);
            const lastReadTimestamp = response.data.lastReadTimestamp;
            
            // Dispatch action to set last read timestamp in Redux state
            dispatch(setLastReadTimestamp(lastReadTimestamp));
        } catch (error) {
            console.error('Error updating last read timestamp:', error);
            throw error;
        }
    }
);

export const fetchTimestamp = createAsyncThunk(
    'users/fetchTimeStamp',
    async (username) => {
        try {
            const response = await apiClient.get(`/users/lastReadTimestamp/${username}`);
            return response.data.lastReadTimestamp;
        } catch (error) {
            console.error(error)
        }
    }
);


const userSlice = createSlice({
    name: 'users',
    initialState: {
        email: '',
        profilePic: null,
        username: null,
        users: [],
        activeUsers: [],
        profilePics: {},
        profilePicUpdate: 0,
        usernameUpdate: false,
        usernameStatus: 'idle',
        unreadMessages: 0,
        lastReadTimestamp: null,
        isLoggedIn: false,
    },
    reducers: {
        setUserPhoto: (state, action) => {
            state.profilePic = action.payload;
        },
        setIsLoggedIn: (state, action) => {
            state.isLoggedIn = action.payload;
        },
        setUsername: (state, action) => {
            state.username = action.payload;
        },
        resetActiveUsers: (state, action) => {
            state.activeUsers = [];
        },
        setLastReadTimestamp: (state, action) => {
            state.lastReadTimestamp = action.payload;
        },
        incrementUnreadMessages: (state) => {
            state.unreadMessages += 1;
        },
        resetUnreadMessages: (state) => {
            state.unreadMessages = 0;
        },
        resetUsername: (state, action) => {
            state.username = null;
        },
        resetEmail: (state, action) => {
            state.email = '';
        },
        resetProfilePicUpdate: (state, action) => {
            state.profilePicUpdate = 0;
        },
        resetProfilePic: (state, action) => {
            state.profilePic = null;
        },
        resetUsernameUpdate: (state, action) => {
            state.usernameUpdate = false;
        },
        resetUsers: (state, action) => {
            state.users = [];
        },
        resetProfilePics: (state, action) => {
            state.profilePics = {};
        },
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
                state.profilePicUpdate += 1;
                state.status = "succeeded";
            })
            .addCase(uploadProfilePic.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchUsername.pending, (state) => {
                state.usernameStatus = "loading";
            })
            .addCase(fetchUsername.fulfilled, (state, action) => {
                state.username = action.payload;
                state.usernameStatus = "succeeded";
            })
            .addCase(fetchUsername.rejected, (state, action) => {
                state.error = action.payload;
                state.usernameStatus = "failed";
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
            .addCase(fetchTimestamp.fulfilled, (state, action) => {
                state.lastReadTimestamp = action.payload;
            })
            .addCase(fetchTimestamp.rejected, (state, action) => {
                console.error(action.payload);
            })
            .addCase(updateUsername.fulfilled, (state, action) => {
                state.usernameUpdate = true;
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
export const selectUsernameStataus = (state) => state.users.usernameStatus;
export const selectTimestamp = (state) => state.users.lastReadTimestamp;
export const selectLoggedIn = (state) => state.users.isLoggedIn;
export const selectProfilePicUpdate = (state) => state.users.profilePicUpdate;
export const selectUsernameUpdate = (state) => state.users.usernameUpdate; 
 
export const { setUsername, setUserPhoto, resetProfilePics, resetProfilePic, resetEmail, resetUsers,
    resetActiveUsers, resetUsernameUpdate, setLastReadTimestamp, incrementUnreadMessages, 
    resetUnreadMessages, resetUsername, setIsLoggedIn, resetProfilePicUpdate } = userSlice.actions;
