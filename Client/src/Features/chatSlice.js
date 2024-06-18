import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

// Async thunk to fetch initial messages
export const fetchMessages = createAsyncThunk(
    'chat/fetchMessages',
    async (poolName, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat`, {
          params: {
            poolName: poolName,
          },
        });
        return response.data.messages; // Assuming the response data has a 'messages' field
      } catch (error) {
        return rejectWithValue(error.response.data); // Pass the error response data to the rejectWithValue handler
      }
    }
  );
  
// Async thunk to send a new message
export const sendMessage = createAsyncThunk(
    'chat/sendMessage',
    async ({ username, message, poolName }) => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/chat`, { username, message, poolName });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        messages: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(sendMessage.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.messages.push(action.payload);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default chatSlice.reducer;

export const selectMessages = (state) => state.chat.messages;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;

export const { addMessage, setUnread, resetUnread } = chatSlice.actions;


