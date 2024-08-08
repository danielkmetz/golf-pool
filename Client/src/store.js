import {configureStore, combineReducers} from "@reduxjs/toolkit";
import leaderboardReducer from './Features/LeaderboardSlice';
import bettingOddsReducer from './Features/bettingOddsSlice';
import myPicksReducer from './Features/myPicksSlice';
import tournamentInfoReducer from "./Features/TournamentInfoSlice";
import paymentStatusReducer from './Features/paymentStatusSlice';
import usersReducer from './Features/userSlice';
import NewsReducer from './Features/NewsSlice';
import PoolsReducer from './Features/poolsSlice';
import chatReducer from './Features/chatSlice';
import pastResultsReducer from './Features/pastResultsSlice';
import balanceReducer from './Features/balanceSlice';

const store = configureStore({
    reducer: combineReducers({
        leaderboard: leaderboardReducer,
        bettingOdds: bettingOddsReducer,
        myPicks: myPicksReducer,
        tournamentInfo: tournamentInfoReducer,
        paymentStatus: paymentStatusReducer,
        users: usersReducer,
        news: NewsReducer,
        pools: PoolsReducer,
        chat: chatReducer,
        pastResults: pastResultsReducer,
        balance: balanceReducer,
    })
});

export default store;

