import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  });

export const fetchPaymentStatus = createAsyncThunk(
    'paymentStatus/fetchPaymentStatus',
    async ({ poolName, username }, { dispatch }) => {
      try {
        // Make a GET request to the /payment-status endpoint, passing poolName and username as query parameters
        const response = await apiClient.get(`/create-pool/payment-status`, {
          params: { poolName, username },
        });
  
        const { paymentStatus } = response.data;
  
        // Dispatch action to set payment status in the Redux store
        dispatch(paymentStatusSlice.actions.setPaymentStatus(paymentStatus));
  
        // Optionally handle payment expiry or show checkout logic
        if (paymentStatus) {
          dispatch(paymentStatusSlice.actions.setShowCheckout(true));
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    }
  );

export const updatePaymentStatus = createAsyncThunk(
    'paymentStatus/updatePaymentStatus',
    async ({ poolName, username }, { dispatch }) => {
      try {
        // Make a PUT request to the /update-payment-status endpoint, sending poolName and username in the request body
        const response = await apiClient.put(`/create-pool/update-payment-status`, {
          poolName,
          username,
        });
  
        if (response.data && response.data.success) {
          // Dispatch action to update the payment status in the Redux store
          dispatch(paymentStatusSlice.actions.setPaymentStatus(true));
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    }
  );

export const batchUpdatePaymentStatus = createAsyncThunk(
    'paymentStatus/batchUpdatePaymentStatus',
    async ({ poolName, usernames }, { dispatch }) => {
      try {
        // Make a PUT request to the batch-update-payment-status endpoint
        const response = await apiClient.put(`/create-pool/batch-update-payment-status`, 
          {
            poolName,
            usernames
          },
        );
  
        // Handle success response
        if (response.data && response.data.updatedUsers) {
          // Optionally, you can dispatch another action to update the store if needed
          console.log(`Updated payment status for users: ${response.data.updatedUsers}`);
        }
  
        return response.data.updatedUsers; // Return the updated users if needed
      } catch (error) {
        console.error('Error in batch updating payment status:', error);
        throw error; // Rethrow the error to be handled in extraReducers or catch block
      }
    }
  );


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