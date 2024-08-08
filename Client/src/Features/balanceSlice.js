import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

// Thunk to get account balance
export const getAccountBalance = createAsyncThunk(
    'balance/getAccountBalance',
    async ({ username, email }) => {
        const getBalanceUrl = `${process.env.REACT_APP_API_URL}/balance/get-balance`;
        const response = await axios.get(getBalanceUrl, {
            params: { username, email }
        });
        return response.data;
    }
);

// Thunk to change username
export const changeUsernameAccountBalance= createAsyncThunk(
    'balance/changeUsername',
    async ({ username, email, newUsername }) => {
        const changeUsernameUrl = `${process.env.REACT_APP_API_URL}/balance/change-username`;
        const response = await axios.post(changeUsernameUrl, { username, email, newUsername });
        return response.data;
    }
);

// Thunk to withdraw balance
export const withdrawBalance = createAsyncThunk(
    'balance/withdrawBalance',
    async ({ username, email, adjustment }, {dispatch}) => {
        const withdrawUrl = `${process.env.REACT_APP_API_URL}/balance/withdraw-balance`;
        const response = await axios.post(withdrawUrl, {
            username, email, adjustment
        });
        console.log(response.data);
        dispatch(setUserBalance(response.data.balance));
        return response.data;
    }
);

export const sendPayment = createAsyncThunk(
    'balance/sendPayment',
    async ({username, email, payout}) => {
        const paymentUrl = `${process.env.REACT_APP_API_URL}/payouts/send-payout`;
        const response = await axios.post(paymentUrl, {username, email, payout});
        return response.data
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
