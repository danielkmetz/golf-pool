import {configureStore, combineReducers} from "@reduxjs/toolkit";
import leaderboardReducer from './Features/LeaderboardSlice';
import bettingOddsReducer from './Features/bettingOddsSlice';
import myPicksReducer from './Features/myPicksSlice';
import tournamentInfoReducer from "./Features/TournamentInfoSlice";
import paymentStatusReducer from './Features/paymentStatusSlice';
import usersReducer from './Features/userSlice';

const store = configureStore({
    reducer: combineReducers({
        leaderboard: leaderboardReducer,
        bettingOdds: bettingOddsReducer,
        myPicks: myPicksReducer,
        tournamentInfo: tournamentInfoReducer,
        paymentStatus: paymentStatusReducer,
        users: usersReducer,
    })
});

export default store;