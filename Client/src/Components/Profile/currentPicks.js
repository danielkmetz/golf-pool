import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectResults, fetchLeaderboard } from '../../Features/LeaderboardSlice';
import GolferTable from './golferTable';
import { getRoundScores } from '../../actions'; 
import { Grid, Typography, Paper, Container, Table, 
    TableContainer, TableRow, TableCell, TableBody } from '@mui/material';
import { selectLiveResults, fetchLiveModel } from '../../Features/LeaderboardSlice';
import { fetchTournamentInfo, selectTournamentInfo } from '../../Features/TournamentInfoSlice';

function CurrentPicks({ tier1Picks, tier2Picks, tier3Picks, tier4Picks}) {
    const dispatch = useDispatch();
    const tournamentInfo = useSelector(selectTournamentInfo);
    const leaderboardResults = useSelector(selectResults);
    const liveResults = useSelector(selectLiveResults);
    
    useEffect(() => {
        // Dispatch fetchLeaderboard action when the component mounts
        dispatch(fetchLeaderboard());
        dispatch(fetchLiveModel());
        dispatch(fetchTournamentInfo());
    }, [dispatch]);

    const allUserPicks = [...tier1Picks, ...tier2Picks, ...tier3Picks, ...tier4Picks]
    const coursePar = tournamentInfo.Par;

    const round1Scores = getRoundScores(allUserPicks, liveResults, 1, coursePar);
    const round2Scores = getRoundScores(allUserPicks, liveResults, 2, coursePar);
    const round3Scores = getRoundScores(allUserPicks, liveResults, 3, coursePar);
    const round4Scores = getRoundScores(allUserPicks, liveResults, 4, coursePar);
    
    round1Scores.sort((a, b) => a - b);
    round2Scores.sort((a, b) => a - b);
    round3Scores.sort((a, b) => a - b);
    round4Scores.sort((a, b) => a - b);

    // Get the lowest 4 scores
    const lowest4ScoresR1 = round1Scores.slice(0, 4);
    const lowest4ScoresR2 = round2Scores.slice(0, 4);
    const lowest4ScoresR3 = round3Scores.slice(0, 4);
    const lowest4ScoresR4 = round4Scores.slice(0, 4);
    
    const totalLowestR1 = lowest4ScoresR1.reduce((total, score) => total + score, 0);
    const totalLowestR2 = lowest4ScoresR2.reduce((total, score) => total + score, 0);
    const totalLowestR3 = lowest4ScoresR3.reduce((total, score) => total + score, 0);
    const totalLowestR4 = lowest4ScoresR4.reduce((total, score) => total + score, 0);
    const totalLowest = totalLowestR1 + totalLowestR2 + totalLowestR3 + totalLowestR4;

    return (
        <Container>
          <Typography variant="h5" align="center" gutterBottom>
              Current Picks
          </Typography>
          <Grid container justifyContent="center" alignItems="center" spacing={.5}>
                {/* Tier 1 Picks */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 1.5 }}>
                        <Typography variant="caption">Tier 1 Picks:</Typography>
                        <GolferTable 
                            tierPicks={tier1Picks} 
                            leaderboardResults={leaderboardResults}
                            liveResults={liveResults}
                            tournamentInfo={tournamentInfo}
                            />
                    </Paper>
                </Grid>
                {/* Tier 2 Picks */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 1.5 }}>
                        <Typography variant="caption">Tier 2 Picks:</Typography>
                        <GolferTable 
                            tierPicks={tier2Picks} 
                            leaderboardResults={leaderboardResults}
                            liveResults={liveResults}
                            tournamentInfo={tournamentInfo}
                            />
                    </Paper>
                </Grid>
                {/* Tier 3 Picks */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 1.5 }}>
                        <Typography variant="caption">Tier 3 Picks:</Typography>
                        <GolferTable 
                            tierPicks={tier3Picks} 
                            leaderboardResults={leaderboardResults}
                            liveResults={liveResults}
                            tournamentInfo={tournamentInfo}
                            />
                    </Paper>
                </Grid>
                {/* Tier 4 Picks */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 1.5 }}>
                        <Typography variant="caption">Tier 4 Picks:</Typography>
                        <GolferTable 
                            tierPicks={tier4Picks} 
                            leaderboardResults={leaderboardResults}
                            liveResults={liveResults}
                            tournamentInfo={tournamentInfo}
                            />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Best 4 Scores</Typography>
                        <TableContainer>
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>R1: {totalLowestR1}</TableCell>
                                        <TableCell>R2: {totalLowestR2}</TableCell>
                                        <TableCell>R3: {totalLowestR3}</TableCell>
                                        <TableCell>R4: {totalLowestR4}</TableCell>
                                        <TableCell>Total: {totalLowest}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
          </Grid>
        </Container>
    );
}

export default CurrentPicks;

