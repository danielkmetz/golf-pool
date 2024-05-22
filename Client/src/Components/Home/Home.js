import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Link, Typography, Button, Grid, CircularProgress } from '@mui/material';
import Leaderboard from '../Leaderboard/Leaderboard';
import RulesDialog from './RulesDialog';
import PoolStandings from '../PoolStandings/poolStandings';
import Weather from '../Weather/Weather';
import TournamentInfo from './TournamentInfo';
import UserList from '../UserList/UserList'; 
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfilePics, selectProfilePics, fetchUsers, selectUsers, fetchUsersWithPicks } from '../../Features/userSlice';

function Home() {
  const [openRules, setOpenRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const users = useSelector(selectUsers);
  const profilePics = useSelector(selectProfilePics);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      dispatch(fetchUsers())
    } catch (error) {
      return error
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchUsersWithPicks(users))
}, [dispatch, users]);

  const userPics = users
  .filter(user => user && user.profilePic)
  .map(user => ({ username: user.username, profilePic: user.profilePic }));

  useEffect(() => {
    try {
      dispatch(fetchProfilePics(userPics));
    } catch (error) {
      return error
    }
  }, [dispatch, users]);

  const handleOpenRules = () => {
    setOpenRules(true);
  };

  const handleCloseRules = () => {
    setOpenRules(false);
  };

  useEffect(() => {
    // Simulate data fetching with a timer
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after data is 'fetched'
    }, 1000); // 2000 ms delay to mimic fetch delay

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid item xs={12} md={4} sx={{marginTop: "1rem"}}>
            <PoolStandings />
          </Grid>
          <Grid item xs={12} md={4} sx={{marginTop: "1rem"}}>
            <Leaderboard />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{marginTop: "1rem"}}>
              <UserList />
            </Paper>
            <Box mt={2}>
              <Button variant="contained" onClick={handleOpenRules} fullWidth>
                View Rules
              </Button>
              <RulesDialog isOpen={openRules} handleClose={handleCloseRules} />
            </Box>
            <Container>
              <TournamentInfo />
              <Weather />
            </Container>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                textAlign: 'right',
              }}
            >
              This is a Daniel Kmetz production
            </Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default Home;
