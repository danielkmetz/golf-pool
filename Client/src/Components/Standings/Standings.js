import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Container, Paper, Typography, Button, Grid, IconButton, Modal} from '@mui/material';
import Leaderboard from '../Leaderboard/Leaderboard';
import RulesDialog from './RulesDialog';
import PoolStandings from '../PoolStandings/poolStandings';
import PoolStandingsMulti from '../PoolStandings/poolStandingsMulti';
import Weather from '../Weather/Weather';
import TournamentInfo from './TournamentInfo';
import UserList from '../UserList/UserList';
import { fetchLeaderboard, fetchLiveModel } from '../../Features/LeaderboardSlice';
import { fetchTournamentInfo } from '../../Features/TournamentInfoSlice';
import { useDispatch, } from 'react-redux';
import { fetchEmail, fetchProfilePic, fetchUsername, 
  fetchUsers, selectEmail, selectLoggedIn, selectUsername, selectUsers, fetchUsersWithPicks, fetchProfilePics, 
  resetProfilePics, resetUsers, resetActiveUsers} from '../../Features/userSlice';
import Chat from '../Chat/Chat';
import GolfBallLoading from '../GolfBallLoading/GolfBallLoading';
import { fetchPoolInfo, fetchPoolUsers, fetchUserPools, resetPoolData, resetPoolName, resetPoolUsers, resetUserPoolData, selectPoolName, 
  selectPoolUsers, selectRoundDay, selectUserPoolData, updateRoundDay, deletePoolCompletely, } from '../../Features/poolsSlice';
import { useSelector } from 'react-redux';
import { fetchTotalPicks, fetchUserPicks, resetAllPicks, selectAllPicks, deleteAllPoolPicks, deleteUserPicks } from '../../Features/myPicksSlice';
import { fetchPastResults } from '../../Features/pastResultsSlice';
import { getAccountBalance } from '../../Features/balanceSlice';
import { useNavigate } from 'react-router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PoolStandingsRound from '../PoolStandings/poolStandingsRound';

function Standings() {
  const [openRules, setOpenRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const poolInfo = useSelector(selectUserPoolData);
  const username = useSelector(selectUsername);
  const email = useSelector(selectEmail);
  const users = useSelector(selectUsers);
  const poolUsers = useSelector(selectPoolUsers);
  const allPicks = useSelector(selectAllPicks);
  const isLoggedIn = useSelector(selectLoggedIn);
  const poolName = useSelector(selectPoolName);
  const roundDay = useSelector(selectRoundDay);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const numTournaments = poolInfo?.numTournaments;
  const finalTournamentDate = numTournaments && poolInfo?.tournaments?.[numTournaments - 1]?.Starts;
  const format = poolInfo?.format;
  const admin = poolInfo?.admin;
  const round = poolInfo?.round;
  
  const prevUserPicsRef = useRef([]);
  const isAdmin = username === admin;

  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  
  useEffect(() => {
    dispatch(fetchUsername());
    dispatch(fetchUsers());
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    try {
      dispatch(fetchLiveModel());
      dispatch(fetchTournamentInfo());
      dispatch(fetchTotalPicks(poolName));
      dispatch(fetchLeaderboard());
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (username && poolName) {
      dispatch(fetchEmail(username));
      dispatch(fetchProfilePic(username));
      dispatch(fetchPastResults(username));
      dispatch(fetchUserPicks({username, poolName}));
      dispatch(fetchPoolInfo(poolName));
      dispatch(fetchPoolUsers(poolName));
    }
  }, [poolName, username]);

  useEffect(() => {
    if (round) {
      dispatch(updateRoundDay(round));
    }
  }, [round])

  useEffect(() => {
    if (username && email) {
      dispatch(getAccountBalance({username, email}));
    }
  }, [email])
  
  useEffect(() => {
    if (poolUsers.length > 0 && poolName) {
      dispatch(fetchUsersWithPicks({users: poolUsers, poolName: poolName}));
    }
  }, [poolUsers, allPicks]);

  const poolUserProfilePics = useMemo(() => {
    return poolUsers.map((user) => {
      const profilePicObj = users?.find((profile) => {
        return profile.username === user.username;
      });
      return { ...user, profilePic: profilePicObj ? profilePicObj.profilePic : '' };
    });
  }, [users, poolUsers]);
  
  const userPics = poolUserProfilePics
    .filter((user) => user.profilePic)
    .map((user) => ({ username: user.username, profilePic: user.profilePic }));
  
  useEffect(() => {
    const fetchPics = async () => {
      const prevUserPics = prevUserPicsRef.current;
      if (JSON.stringify(prevUserPics) !== JSON.stringify(userPics)) {
        dispatch(fetchProfilePics(userPics));
        prevUserPicsRef.current = userPics;
      }
    };
    fetchPics();
  }, [userPics, allPicks]);

  useEffect(() => {
    if (finalTournamentDate) {
      const tournamentEndDate = new Date(finalTournamentDate);
      
      // Add 4 days to the last tournament start date
      const tournamentEndDatePlusFour = new Date(tournamentEndDate);
      tournamentEndDatePlusFour.setDate(tournamentEndDatePlusFour.getDate() + 4);
      
      // Compare dates directly
      if (currentDate > tournamentEndDatePlusFour && (format === 'Multi-Week' || format === 'Multi-Week Salary Cap')) {
        setShowModal(true);
      }
    }
  }, [finalTournamentDate, format]);

  useEffect(() => {
    if (roundDay ) {
      if (roundDay === 6 && currentDay === 0) {
        setShowModal(true);
      };
      if (currentDay > roundDay) {
        setShowModal(true);
      };
    }
  }, [roundDay, currentDay])

  const handleOpenRules = () => {
    setOpenRules(true);
  };

  const handleCloseRules = () => {
    setOpenRules(false);
  };

  const handleDeletePool = async () => {
    if (poolName) {
        try {
            // Await the completion of deletePoolCompletely before proceeding
            await dispatch(deletePoolCompletely(poolName)).unwrap();
            
            // Reset relevant states after successful deletion
            dispatch(deleteAllPoolPicks(poolUsers));
            dispatch(resetPoolName());
            dispatch(resetPoolUsers());
            dispatch(resetActiveUsers());
            dispatch(resetUserPoolData());
            
            // Close the modal and navigate to the CreatePool page
            setShowDeleteModal(false);
            setShowModal(false);
            navigate('TabNavigator', { screen: 'Create Pool' });
        } catch (error) {
            console.error('Error deleting pool:', error);
            // Optionally, you could set some error state here if needed
        }
    }
  };

  const handlePoolConclusion = async () => {
    if (poolName && username) {
      await dispatch(deleteUserPicks({username, poolName}));
      setShowModal(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackPress = async () => {
    await dispatch(resetPoolName());
    dispatch(resetAllPicks());
    dispatch(resetPoolUsers());
    dispatch(resetUsers());
    dispatch(resetPoolData());
    dispatch(resetUserPoolData());
    dispatch(resetActiveUsers());
    dispatch(resetProfilePics());
    dispatch(fetchUserPools(username));
    navigate('/my-pools');
  };
  
  return (
    <Box
      sx={{
        maxHeight: '100vh',
        marginTop: '1rem',
      }}
    >
      <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <GolfBallLoading />
          </Box>
        ) : (
          <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'tan',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              position: 'absolute',
              left: 0,
              mb: '1rem',
              boxShadow: '0 3px 5px rgba(0,0,0,0.2)', // Optional: Add shadow for button-like effect
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#d5d5d5', // Optional: Change background color on hover
              },
              mt: '.75rem',
              ml: '.75rem'
            }}
            onClick={handleBackPress} // Handle the click event for the entire box
          >
            <IconButton sx={{ color: '#222', p: 0 }}>
              <ArrowBackIcon style={{ color: '#222' }} />
            </IconButton>
            <Typography variant="h6" sx={{ color: '#222', fontWeight: 'bold', ml: 1 }}>
              My Pools
            </Typography>
          </Box>
            <Grid item xs={12} md={4} sx={{ marginTop: '1rem' }}>
              {format === "Multi-Week" || format === "Multi-Week Salary Cap" ? 
                <PoolStandingsMulti /> :
                format === 'Single Round' ?
                <PoolStandingsRound /> :
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
            <Modal
              open={showModal}
              aria-labelledby="tournament-end-modal-title"
              aria-describedby="tournament-end-modal-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  textAlign: 'center'
                }}
              >
                <Typography id="tournament-end-modal-title" variant="h6" component="h2">
                  Your tournament has ended
                </Typography>

                {isAdmin && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeletePool}
                    sx={{ mt: 2 }}
                  >
                    Delete Pool
                  </Button>
                )}

                <Button
                  variant="contained"
                  onClick={handlePoolConclusion}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </Box>
            </Modal>
          </>
        )}
      </Grid>
    </Box>
  );
}

export default Standings;
