import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

export const fetchPaymentStatus = createAsyncThunk(
    'paymentStatus/fetchPaymentStatus',
    async (username, {dispatch}) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/users/paymentStatus/${username}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            const { paymentStatus, paymentExpiryDate } = response.data;

            dispatch(paymentStatusSlice.actions.setPaymentStatus(paymentStatus));

            if (paymentStatus && new Date(paymentExpiryDate) > new Date()) {
                dispatch(paymentStatusSlice.actions.setShowCheckout(true))
            }
        } catch (error) {
            console.error(error)
        }
    }
)

export const updatePaymentStatus = createAsyncThunk(
    'paymentStatus/updatePaymentStatus',
    async ({username, status}, {dispatch}) => {
        console.log(username, status)
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/paymentStatus/${username}`, {
                paymentStatus: status
            })

            if (response.data && response.data.success) {
                dispatch(paymentStatusSlice.actions.setPaymentStatus(status))
            }
        } catch (error) {
            console.error(error)
        }
    }
)

const paymentStatusSlice = createSlice({
    name: 'paymentStatus',
    initialState: {
        paymentStatus: null,
        showCheckout: true,
    },
    reducers: {
        setPaymentStatus: (state, action) => {
            state.paymentStatus = action.payload;
        },
        setShowCheckout: (state, action) => {
            state.showCheckout = action.payload;
        }
    },
})

export default paymentStatusSlice.reducer;

export const { setPaymentStatus, setShowCheckout } = paymentStatusSlice.actions;
export const selectPaymentStatus = (state) => state.paymentStatus.paymentStatus;
export const selectShowCheckout = (state) => state.paymentStatus.showCheckout;