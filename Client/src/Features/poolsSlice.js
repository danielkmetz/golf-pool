import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  });

export const fetchPools = createAsyncThunk(
    'pools/fetchPools',
    async () => {
        const response = await apiClient.get(`/create-pool/pools`);
        return response.data;
    }
);

export const fetchPoolUsers = createAsyncThunk(
    'pools/fetchPoolUsers',
    async (poolName) => {
        try {
            const response = await apiClient.get(`/create-pool/users-in-pool`, {
                params: {
                    poolName: poolName,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching users', error)
        }
    }
);

export const fetchPoolInfo = createAsyncThunk(
    'pools/fetchPoolInfo',
    async (poolName) => {
        try {
            const response = await apiClient.get(`/create-pool/my-pool-info`, {
                params: {
                    poolName: poolName,
                }
            });
            return response.data.pool;
        } catch (error) {
            console.error('Error fetching users', error)
        }
    }
);

export const removeUserFromPool = createAsyncThunk(
    'pools/removeUserFromPool',
    async ({ poolName, username }) => {
        const response = await apiClient.delete(`/create-pool/remove-user`, {
            data: { poolName, username }
        });
        return response.data;
    }
);

export const fetchPoolName = createAsyncThunk(
    'pools/fetchPoolName',
    async (username, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/create-pool/user-pool-name`, {
                params: { username }
            });
            return response.data.poolName;
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const fetchPoolAdmin = createAsyncThunk(
    'pools/fetchPoolAdmin',
    async (poolName, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/create-pool/admin`, {
                params: { poolName }
            });
            return response.data.admin;
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
);

export const updateAdmin = createAsyncThunk(
  'pools/updateAdmin',
  async ({ poolName, newAdmin }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/create-pool/update-admin`, {
        poolName,
        newAdmin,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deletePool = createAsyncThunk(
    'pools/deletePool',
    async ({poolName, username}) => {
        const response = await apiClient.delete(`/create-pool/pool`, {
            data: { poolName, username }
        });
        return response.data;
    }
);

export const deletePoolCompletely = createAsyncThunk(
    'pools/deletePoolCompletely',
    async (poolName, { rejectWithValue }) => {
        try {
            const response = await apiClient.delete(`/create-pool/delete-pool`, {
                data: { poolName }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Error deleting pool');
        }
    }
);

export const editPoolSettings = createAsyncThunk(
    'pools/editPoolSettings',
    async (data, { rejectWithValue }) => {
        console.log(data);
        try {
            const response = await apiClient.put(`/create-pool/edit-pool`, data);
            return response.data; // Assuming the backend returns updated pool data
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserPools = createAsyncThunk(
    'pools/fetchUserPools',
    async (username, { rejectWithValue }) => {
      try {
        const response = await apiClient.get('/create-pool/all-pools', {
          params: { username },
        });
        return response.data.poolNames;
      } catch (error) {
        // Return early on failure
        return rejectWithValue(error.response?.data || 'Error fetching pool name');
      }
    }
  );

  const poolSlice = createSlice({
    name: 'pools',
    initialState: {
        poolData: [],
        poolUsers: [],
        status: 'idle',
        error: null,
        poolName: null,
        poolNameStatus: 'idle',
        poolAdmin: null,
        userPoolData: [],
        initialBalance: 100,
        roundDay: null,
        userPools: [],
    },
    reducers: {
        resetPoolData: (state, action) => {
            state.poolData = [];
        },
        resetPoolUsers: (state, action) => {
            state.poolUsers = [];
        },
        resetPoolName: (state, action) => {
            state.poolName = null;
        },
        resetUserPoolData: (state, action) => {
            state.userPoolData = [];
        },
        setPoolName: (state, action) => {
            state.poolName = action.payload;
        },
        setUserPoolData: (state, action) => {
            state.userPoolData = action.payload;
        },
        subtractInitialBalance: (state, action) => {
            state.initialBalance = (state.initialBalance - action.payload);
        },
        addInitialBalance: (state, action) => {
            state.initialBalance = (state.initialBalance + action.payload);
        },
        resetInitialBalance: (state, action) => {
            state.initialBalance = 100;
        },
        resetUserPools: (state, action) => {
            state.userPools = [];
        },
        updateRoundDay(state, action) {
            const { round } = action.payload;
            
            switch (round) {
              case "Opening Day":
                state.roundDay = 4;
                break;
              case "Packing Day":
                state.roundDay = 5;
                break;
              case "Moving Day":
                state.roundDay = 6;
                break;
              default:
                state.roundDay = 0;
                break;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPools.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchPools.fulfilled, (state, action) => {
                state.poolData = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchPools.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchPoolUsers.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchPoolUsers.fulfilled, (state, action) => {
                state.poolUsers = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchPoolUsers.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(removeUserFromPool.pending, (state) => {
                state.status = "loading";
            })
            .addCase(removeUserFromPool.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Optionally update the state if necessary, e.g., remove the user from the poolData
                const { poolName, username } = action.meta.arg;
                const pool = state.poolData.find(pool => pool.poolName === poolName);
                if (pool) {
                    pool.users = pool.users.filter(user => user.username !== username);
                }
            })
            .addCase(fetchPoolName.fulfilled, (state, action) => {
                state.poolName = action.payload;
                state.poolNameStatus = null;
              })
            .addCase(fetchPoolName.pending, (state, action) => {
                state.poolNameStatus = "loading";
            })
            .addCase(fetchPoolName.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchPoolAdmin.fulfilled, (state, action) => {
                state.poolAdmin = action.payload;
                state.poolNameStatus = "succeeded";
              })
            .addCase(fetchPoolAdmin.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(updateAdmin.fulfilled, (state, action) => {
                state.admin = action.payload.newAdmin;
            })
            .addCase(updateAdmin.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(deletePool.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deletePool.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Optionally update the state if necessary, e.g., remove the pool from poolData
                state.poolData = state.poolData.filter(pool => pool.poolName !== action.meta.arg);
            })
            .addCase(deletePool.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchPoolInfo.fulfilled, (state, action) => {
                state.userPoolData = action.payload;
            })
            .addCase(fetchPoolInfo.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(editPoolSettings.pending, (state) => {
                state.status = "loading";
            })
            .addCase(editPoolSettings.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.userPoolData = action.payload;
                // Optionally update the state if needed
                // For example, update poolData with the updated pool settings
            })
            .addCase(editPoolSettings.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(deletePoolCompletely.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deletePoolCompletely.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Optionally remove the deleted pool from poolData
                state.poolData = state.poolData.filter(pool => pool.poolName !== action.meta.arg);
            })
            .addCase(deletePoolCompletely.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
            .addCase(fetchUserPools.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchUserPools.fulfilled, (state, action) => {
                state.status = "succeeded";
                // Optionally remove the deleted pool from poolData
                state.userPools = action.payload;
            })
            .addCase(fetchUserPools.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
    },
});

export default poolSlice.reducer;

export const selectPools = (state) => state.pools.poolData;
export const selectPoolUsers = (state) => state.pools.poolUsers;
export const selectPoolName = (state) => state.pools.poolName;
export const selectPoolNameStatus = (state) => state.pools.poolNameStatus;
export const selectPoolAdmin = (state) => state.pools.poolAdmin;
export const selectUserPoolData = (state) => state.pools.userPoolData;
export const selectInitialBalance = (state) => state.pools.initialBalance;
export const selectRoundDay = (state) => state.pools.roundDay;
export const selectUserPools = (state) => state.pools.userPools;

export const { resetPoolData, 
    resetPoolUsers, resetPoolName, setPoolName, resetUserPoolData, subtractInitialBalance,
     addInitialBalance, resetInitialBalance,
    setUserPoolData, updateRoundDay, resetUserPools } = poolSlice.actions;
