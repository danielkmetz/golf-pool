import React, { useState, useEffect } from 'react';
import { 
    TableContainer, 
    Table, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody,
    Typography,
    Paper,
    Avatar,
    Container,
  } from '@mui/material';
import GolfersModal from './golfersModal';
import { fetchTotalPicks, selectTotalPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLiveModel, selectLiveResults } from '../../Features/LeaderboardSlice';
import { fetchTournamentInfo, selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { fetchUsers, selectUsers, selectActiveUsers, fetchUsersWithPicks } from '../../Features/userSlice';
import { getRoundScore } from '../../actions';
import Payouts from '../Payouts/Payouts';
import axios from 'axios';

function PoolStandings() {
    const users = useSelector(selectUsers);
    const activeUsers = useSelector(selectActiveUsers);
    const [selectedUser, setSelectedUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [profilePics, setProfilePics] = useState({});
    const liveResults = useSelector(selectLiveResults);
    const tournamentInfo = useSelector(selectTournamentInfo);
    const totalPicks = useSelector(selectTotalPicks);
    const dispatch = useDispatch();
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    //const coursePar = tournamentInfo.Par;

    const coursePar = 71;

    //fetch all current users from mongoDB
    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchLiveModel());
        dispatch(fetchTournamentInfo());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchTotalPicks());
    }, [dispatch])

    const organizeAndCalculateLowestScores = (userData, resultsData, coursePar) => {
        let organizedData = [];
      
        userData.forEach(user => {
          user.userPicks.forEach(pick => {
            pick.golferName.forEach(golfer => {
              organizedData.push({
                  golferName: golfer,
                  username: user.username,
                  R1: getRoundScore(1, golfer, resultsData, coursePar),
                  R2: getRoundScore(2, golfer, resultsData, coursePar),
                  R3: getRoundScore(3, golfer, resultsData, coursePar),
                  R4: getRoundScore(4, golfer, resultsData, coursePar),
                });
            });
          
          });
        });
      
        const calculateLowestScores = (username, round) => {
          const userScores = organizedData.filter(item => item.username === username);
          const lowestScores = userScores.map(item => item[round]).sort((a, b) => a - b).slice(0, 4);
          const totalLowestScore = lowestScores.reduce((total, score) => total + score, 0);
          return totalLowestScore;
        };
      
        return { organizedData, calculateLowestScores };
      };
      
      const { organizedData, calculateLowestScores } = organizeAndCalculateLowestScores(
        totalPicks,
        liveResults,
        coursePar
      );
      
    const handleClick = (user) => {
        setSelectedUser(user.username);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedUser(null);
        setOpen(false);
    }
  //Fetch users with active picks
  useEffect(() => {
      dispatch(fetchUsersWithPicks(users))
  }, [dispatch, users]);

  //Fetch profile pictures  
  useEffect(() => {
      const fetchProfilePics = async () => {
          const pics = {};
          for (const user of users) {
              try {
                  const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile-pics/${user.username}`, {
                      responseType: 'arrayBuffer',
                  });
                  pics[user.username] = response.data;
              } catch (error) {
                  console.error(`Error fetching profile picture for ${user.username}:`, error);
              }
          }
          setProfilePics(pics);
      };
      fetchProfilePics();
  }, [users]);

  return (
      <>
        <Paper sx={{ padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <Typography
                  variant="h4"
                  sx={{
                  marginTop: '1rem',
                  backgroundColor: '#009688', // Orange background color
                  color: '#FFF', // White text color
                  fontFamily: 'Roboto, sans-serif', // Use a professional font
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  textAlign: 'center',
                  padding: '1rem', // Add padding for better spacing
                  borderRadius: '8px', // Rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
                  }}
              >
                  POOL STANDINGS
              </Typography>
          </Paper>
          <Container>
            <Payouts/>
          </Container>
          <TableContainer sx={{maxHeight: '600px'}}>
            <Table>
                <TableHead 
                sx={{
                    backgroundColor: "blanchedalmond", 
                    position: "sticky", 
                    zIndex: 3, 
                    top: "0px",
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                }}
                >
                    <TableRow>
                        <TableCell sx={{ fontSize: '12px' }}>Player</TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R1</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R2</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R3</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R4</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>Total</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {activeUsers.map(user => {
                        const totalScore =
                          calculateLowestScores(user.username, 'R1') +
                          calculateLowestScores(user.username, 'R2') +
                          calculateLowestScores(user.username, 'R3') +
                          calculateLowestScores(user.username, 'R4');

                        return {
                          user,
                          totalScore,
                        };
                    }).sort((a, b) => a.totalScore - b.totalScore).map(({ user, totalScore }) => (
                          <TableRow key={user._id}>
                            <TableCell 
                              onClick={() => handleClick(user)} 
                              style={{cursor: 'pointer', display: 'flex', alignItems: 'center',}}
                            >
                              {user.username}
                              <Avatar src={`${profilePics[user.username]}`} sx={{marginLeft: '.5rem'}}/>
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateLowestScores(user.username, 'R1')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateLowestScores(user.username, 'R2')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateLowestScores(user.username, 'R3')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateLowestScores(user.username, 'R4')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{totalScore}</TableCell>
                          </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
            { currentDay >= 4 || currentDay === 0 ? <GolfersModal user={selectedUser} isOpen={open} handleClose={handleClose}/> : null }
        </TableContainer>
      </>
    );
}

export default PoolStandings;
