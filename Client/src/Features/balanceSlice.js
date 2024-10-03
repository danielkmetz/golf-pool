import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  });

// Thunk to get account balance
export const getAccountBalance = createAsyncThunk(
    'balance/getAccountBalance',
    async ({ username, email }) => {
        const getBalanceUrl = `/balance/get-balance`;
        const response = await apiClient.get(getBalanceUrl, {
            params: { username, email }
        });
        return response.data;
    }
);

// Thunk to change username
export const changeUsernameAccountBalance= createAsyncThunk(
    'balance/changeUsername',
    async ({ username, email, newUsername }) => {
        const changeUsernameUrl = `/balance/change-username`;
        const response = await apiClient.post(changeUsernameUrl, { username, email, newUsername });
        return response.data;
    }
);

// Thunk to withdraw balance
export const withdrawBalance = createAsyncThunk(
    'balance/withdrawBalance',
    async ({ username, email, adjustment }, {dispatch}) => {
        const withdrawUrl = `/balance/withdraw-balance`;
        const response = await apiClient.post(withdrawUrl, {
            username, email, adjustment
        });
        dispatch(setUserBalance(response.data.balance));
        return response.data;
    }
);

export const sendPayment = createAsyncThunk(
    'balance/sendPayment',
    async ({username, email, payout}) => {
        const paymentUrl = `/payouts/send-payout`;
        const response = await apiClient.post(paymentUrl, {username, email, payout});
        return response.data
    }
);

// Thunk to delete a user
export const deleteUserBalance = createAsyncThunk(
    'balance/deleteUserAccount',
    async ({ username, email }, { rejectWithValue }) => {
        try {
            const deleteUserUrl = `/balance/delete-user`;
            const response = await apiClient.delete(deleteUserUrl, {
                data: { username, email } // Axios requires data to be sent in the body for DELETE requests
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
        }
    }
);

export const balanceSlice = createSlice({
    name: 'balance',
    initialState: {
        userBalance: null,
        status: 'idle',
        error: null,
        changeUsernameStatus: 'idle',
        changeUsernameError: null,
        paymentSent: null,
        paymentStatus: 'idle',
        paymentError: null,
    },
    reducers: {
        resetBalance: (state) => {
            state.userBalance = null;
            state.status = 'idle';
            state.error = null;
        },
        resetChangeUsername: (state) => {
            state.changeUsernameStatus = 'idle';
            state.changeUsernameError = null;
        },
        resetWithdrawStatus: (state) => {
            state.withdrawStatus = 'idle';
            state.withdrawError = null;
        },
        setUserBalance: (state, action) => {
            state.userBalance = action.payload;
        },
        resetPaymentSent: (state, action) => {
            state.paymentSent = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAccountBalance.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getAccountBalance.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userBalance = action.payload;
            })
            .addCase(getAccountBalance.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(changeUsernameAccountBalance.pending, (state) => {
                state.changeUsernameStatus = 'loading';
            })
            .addCase(changeUsernameAccountBalance.fulfilled, (state, action) => {
                state.changeUsernameStatus = 'succeeded';
            })
            .addCase(changeUsernameAccountBalance.rejected, (state, action) => {
                state.changeUsernameStatus = 'failed';
                state.changeUsernameError = action.error.message;
            })
            .addCase(withdrawBalance.pending, (state) => {
                state.withdrawStatus = 'loading';
            })
            .addCase(withdrawBalance.fulfilled, (state, action) => {
                state.withdrawStatus = 'succeeded';
            })
            .addCase(withdrawBalance.rejected, (state, action) => {
                state.withdrawStatus = 'failed';
                state.withdrawError = action.error.message;
            })
            .addCase(sendPayment.pending, (state) => {
                state.paymentStatus = 'loading';
            })
            .addCase(sendPayment.fulfilled, (state, action) => {
                state.paymentStatus = 'succeeded';
                state.paymentSent = true;
            })
            .addCase(sendPayment.rejected, (state, action) => {
                state.paymentStatus = 'failed';
                state.paymentError = action.error.message;
            })
            .addCase(deleteUserBalance.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUserBalance.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userBalance = null;
            })
            .addCase(deleteUserBalance.rejected, (state, action) => {
                state.status = 'failed';
            })
    }
});

export default balanceSlice.reducer;

export const { 
    resetBalance, 
    resetChangeUsername, 
    resetWithdrawStatus,
    resetPaymentSent, 
    setUserBalance } = balanceSlice.actions;
export const selectUserBalance = (state) => state.balance.userBalance;
export const selectBalanceStatus = (state) => state.balance.status;
export const selectBalanceError = (state) => state.balance.error;
export const selectChangeUsernameStatus = (state) => state.balance.changeUsernameStatus;
export const selectChangeUsernameError = (state) => state.balance.changeUsernameError;
export const selectWithdrawStatus = (state) => state.balance.withdrawStatus;
export const selectWithdrawError = (state) => state.balance.withdrawError;
export const selectPaymentSent = (state) => state.balance.paymentSent;
