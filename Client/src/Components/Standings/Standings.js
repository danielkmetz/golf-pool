import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, Grid, } from '@mui/material';
import Leaderboard from '../Leaderboard/Leaderboard';
import RulesDialog from './RulesDialog';
import PoolStandings from '../PoolStandings/poolStandings';
import PoolStandingsMulti from '../PoolStandings/poolStandingsMulti';
import Weather from '../Weather/Weather';
import TournamentInfo from './TournamentInfo';
import UserList from '../UserList/UserList';
import { fetchLiveModel } from '../../Features/LeaderboardSlice';
import { fetchTournamentInfo } from '../../Features/TournamentInfoSlice';
import { useDispatch, } from 'react-redux';
import { fetchUsers } from '../../Features/userSlice';
import Chat from '../Chat/Chat';
import GolfBallLoading from '../GolfBallLoading/GolfBallLoading';
import { selectUserPoolData } from '../../Features/poolsSlice';
import { useSelector } from 'react-redux';

function Standings() {
  const [openRules, setOpenRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const poolInfo = useSelector(selectUserPoolData);
  const dispatch = useDispatch();

  const format = poolInfo.format;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUsers());
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchLiveModel());
    dispatch(fetchTournamentInfo());
  }, [dispatch]);

  const handleOpenRules = () => {
    setOpenRules(true);
  };

  const handleCloseRules = () => {
    setOpenRules(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        maxHeight: '100vh',
      }}
    >
      <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <GolfBallLoading />
          </Box>
        ) : (
          <>
            <Grid item xs={12} md={4} sx={{ marginTop: '1rem' }}>
              {format === "Multi-Week" || format === "Multi-Week Salary Cap" ? 
                <PoolStandingsMulti /> :
                <PoolStandings />
              }
            </Grid>
            <Grid item xs={12} md={4} sx={{ marginTop: '1rem' }}>
              <Leaderboard />
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ marginTop: '1rem' }}>
                <UserList />
              </Paper>
              <Box mt={2}>
              <Button
                variant="contained"
                onClick={handleOpenRules}
                fullWidth
                sx={{
                  backgroundColor: '#222',
                  '&:hover': {
                    backgroundColor: '#004d00',
                  },
                }}
              >
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
              <Chat />
              <Typography
                variant="subtitle1"
                align="right"
                sx={{
                  textAlign: 'right',
                  marginRight: '1rem',
                  marginTop: '.25rem',
                }}
              >
                This is a Daniel Kmetz production
              </Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}

export default Standings;
