import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNews = createAsyncThunk(
    'news/fetchNews',
    async () => {
        const response = await axios.get(process.env.REACT_APP_ESPN_API);
        return response.data.articles;
    }
);

const NewsSlice = createSlice({
    name: 'news',
    initialState: {
        newsResults: [],
    },
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNews.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.newsResults = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.error = action.payload;
                state.status = "failed";
            })
    },
})

export default NewsSlice.reducer;

export const selectNews = (state) => state.news.newsResults;
export const selectTweets = (state) => state.news.tweets;