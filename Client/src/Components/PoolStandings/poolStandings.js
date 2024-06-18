import React, { useState, useEffect, useMemo } from 'react';
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
import { selectLiveResults } from '../../Features/LeaderboardSlice';
import { selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { selectProfilePics, selectActiveUsers, 
  selectUsers, fetchProfilePics, 
  fetchUsersWithPicks, } from '../../Features/userSlice';
import { selectPoolUsers } from '../../Features/poolsSlice';
import { getRoundScore, sortUsers, } from '../../actions';
import Payouts from '../Payouts/Payouts';
import PoolInfo from '../PoolInfo/PoolInfo';
import Results from '../Results/Results';

function PoolStandings() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [open, setOpen] = useState(false);
    const liveResults = useSelector(selectLiveResults);
    const tournamentInfo = useSelector(selectTournamentInfo);
    const poolUsers = useSelector(selectPoolUsers);
    const totalPicks = useSelector(selectTotalPicks);
    const profilePics = useSelector(selectProfilePics)
    const users = useSelector(selectUsers);
    const dispatch = useDispatch();
    const activeUsers = useSelector(selectActiveUsers);
    const [podiumOpen, setPodiumOpen] = useState(false);
  
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const coursePar = tournamentInfo.Par;

   useEffect(() => {
        dispatch(fetchTotalPicks());
    }, [dispatch]);

    useEffect(() => {
      if (poolUsers.length > 0) {
        dispatch(fetchUsersWithPicks(poolUsers));
      }
    }, [dispatch, poolUsers]);
    
    const poolUserProfilePics = useMemo(() => {
      return poolUsers.map(user => {
        const profilePicObj = users.find(profile => profile.username === user.username);
        const profilePic = profilePicObj ? profilePicObj.profilePic : '';
        return { ...user, profilePic };
      });
    }, [users, poolUsers]);
  
    const userPics = poolUserProfilePics
      .filter(user => user && user.profilePic)
      .map(user => ({ username: user.username, profilePic: user.profilePic }));
  
    useEffect(() => {
      if (userPics.length > 0) {
        dispatch(fetchProfilePics(userPics));
      }
    }, [dispatch, poolUsers]);  

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
          if (currentDay < 4 && currentDay !== 0) return null; // Skip calculation if before Thursday and not Sunday

          const userScores = organizedData.filter(item => item.username === username);
          const roundScores = userScores.map(item => item[round]).filter(score => score !== null && score !== undefined);

          if (roundScores.length < 8) return null; // Not enough valid scores to calculate

          const lowestScores = roundScores.sort((a, b) => a - b).slice(0, 4);
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

    const allGolfersHaveR4Score = useMemo(() => {
        return organizedData.every(golfer => golfer.R4 !== null && golfer.R4 !== undefined);
      }, [organizedData]);
      
    const handleClick = (user) => {
        setSelectedUser(user.username);
        setOpen(true);
    };

    const handleClose = () => {
        setSelectedUser(null);
        setOpen(false);
    }

    const handlePodiumClose = () => {
      setPodiumOpen(false);
    }

    useEffect(() => {
      if (currentDay === 0 && allGolfersHaveR4Score) {
        setPodiumOpen(true);
      }
    }, [currentDay, allGolfersHaveR4Score]);

    const sortedUsers = useMemo(() => sortUsers(activeUsers, calculateLowestScores), [activeUsers, calculateLowestScores]);

    const topThreeUsers = sortedUsers.slice(0, 3);
  
    return (
      <>
        <Paper sx={{ padding: '1rem', 
          marginBottom: '.5rem', 
          borderRadius: '8px',
          backgroundColor: 'LightGray', 
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }}>
              <Typography
                  variant="h4"
                  sx={{
                  backgroundColor: '#222', // Orange background color
                  color: '#FFF', // White text color
                  fontFamily: 'Roboto, sans-serif', // Use a professional font
                  fontWeight: 'bold',
                  fontSize: '2rem',
                  textAlign: 'center',
                  padding: '.5rem', // Add padding for better spacing
                  borderRadius: '8px', // Rounded corners
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
                  }}
              >
                  POOL STANDINGS
              </Typography>
          </Paper>
          <Container>
            <PoolInfo />
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
        <Results
          podiumOpen={podiumOpen}
          handlePodiumClose={handlePodiumClose}
          topThreeUsers={topThreeUsers}
        />
      </>
    );
}

export default PoolStandings;
