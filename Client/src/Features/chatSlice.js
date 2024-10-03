import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Async thunk to fetch initial messages
export const fetchMessages = createAsyncThunk(
    'chat/fetchMessages',
    async (poolName, { rejectWithValue }) => {
      try {
        const response = await apiClient.get(`/chat`, {
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
        const response = await apiClient.post(`/chat`, { username, message, poolName });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
);

// Async thunk to delete a user's messages
export const deleteUserMessages = createAsyncThunk(
  'chat/deleteUserMessages',
  async (username, { rejectWithValue }) => {
      try {
          const response = await apiClient.delete(`/chat/delete-user/${username}`);
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data?.message || 'Failed to delete user messages');
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
            })
            .addCase(deleteUserMessages.pending, (state) => {
              state.status = 'loading';
            })
            .addCase(deleteUserMessages.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Optionally, you could remove all messages from the state
                state.messages = [];
            })
            .addCase(deleteUserMessages.rejected, (state, action) => {
                state.status = 'failed';
            });
    }
});

export default chatSlice.reducer;

export const selectMessages = (state) => state.chat.messages;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;

export const { addMessage, setUnread, resetUnread } = chatSlice.actions;


