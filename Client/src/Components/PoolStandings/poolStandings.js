import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from '@mui/material';
import GolfersModal from './golfersModal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchTotalPicks, selectTotalPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectLiveResults } from '../../Features/LeaderboardSlice';
import { selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { selectProfilePics, selectActiveUsers, 
  selectUsers, fetchProfilePics, 
  fetchUsersWithPicks, selectUsername, } from '../../Features/userSlice';
import { selectPoolUsers } from '../../Features/poolsSlice';
import { getRoundScore, sortUsers, } from '../../actions';
import { sendUserPositionMap } from '../../Features/pastResultsSlice';
import { selectUserPoolData } from '../../Features/poolsSlice';
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
    const username = useSelector(selectUsername);
    const poolInfo = useSelector(selectUserPoolData);
    const dispatch = useDispatch();
    const activeUsers = useSelector(selectActiveUsers);
    const [podiumOpen, setPodiumOpen] = useState(false);
    const [shouldFetch, setShouldFetch] = useState(true);

    const format = poolInfo.format;
    const firstPlacePercentage = poolInfo?.payouts?.[0]?.first || 0;
    const secondPlacePercentage = poolInfo?.payouts?.[0]?.second || 0;
    const thirdPlacePercentage = poolInfo?.payouts?.[0]?.third || 0;
    const buyIn = poolInfo?.buyIn || 0;

    const totalActive = activeUsers.length;
    const firstPlacePayout = Math.floor((totalActive * buyIn) * firstPlacePercentage);
    const secondPlacePayout = Math.floor((totalActive * buyIn) * secondPlacePercentage);
    const thirdPlacePayout = Math.floor((totalActive * buyIn) * thirdPlacePercentage);
  
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const coursePar = tournamentInfo.Par;
    const tournamentName = tournamentInfo.Name;
    
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
    }, [poolUsers]);
  
    const userPics = poolUserProfilePics
      .filter(user => user && user.profilePic)
      .map(user => ({ username: user.username, profilePic: user.profilePic }));

    useEffect(() => {
      if (userPics.length > 0) {
        dispatch(fetchProfilePics(userPics));
      }
    }, [dispatch, poolUsers]);  

    const organizeAndCalculateScores = (userData, resultsData, coursePar, format) => {
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
    
      const calculateScores = (username, round) => {
          if (currentDay < 4 && currentDay !== 0) return null; // Skip calculation if before Thursday and not Sunday
    
          const userScores = organizedData.filter(item => item.username === username);
          const roundScores = userScores.map(item => item[round]);
    
          // Check if all golfers have scores for the current round
          const allGolfersHaveScores = roundScores.every(score => score !== null && score !== undefined);
    
          if (!allGolfersHaveScores) return null;
    
          if (format === "Salary Cap") {
              // Calculate total score for all golfers
              const totalScore = roundScores.reduce((total, score) => total + score, 0);
              return totalScore;
          } else {
              // Calculate lowest 4 scores
              if (roundScores.length < 8) return null; // Not enough valid scores to calculate
              const lowestScores = roundScores.sort((a, b) => a - b).slice(0, 4);
              const totalLowestScore = lowestScores.reduce((total, score) => total + score, 0);
              return totalLowestScore;
          }
      };
    
      return { organizedData, calculateScores };
    };
    
    const { organizedData, calculateScores } = organizeAndCalculateScores(
        totalPicks,
        liveResults,
        coursePar,
        format
    );

    const allGolfersHaveR4Score = useMemo(() => {
        return organizedData.every(golfer => golfer.R4 !== null && golfer.R4 !== undefined);
      }, [organizedData]);
    
    const isSundayComplete =
      currentDay === 0 && allGolfersHaveR4Score;

    //console.log(isSundayComplete);
      
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
      if (isSundayComplete) {
        setPodiumOpen(true);
      }
    }, [isSundayComplete]);

    const sortedUsers = useMemo(() => sortUsers(activeUsers, calculateScores), [activeUsers, calculateScores]);

    const topThreeUsers = sortedUsers.slice(0, 3);

    const userPositionMap = sortedUsers.reduce((acc, user, index, array) => {
      let position = index + 1;
      if (index > 0 && user.totalScore === array[index - 1].totalScore) {
        position = acc[array[index - 1].user.username]; // Use the previous user's position directly
        if (typeof position === 'number') {
          position = `T${position}`; // Add the "T" if it's not already present
        }
      }
      acc[user.user.username] = position;
      return acc;
    }, {});
    
    useEffect(() => {
      // Check if all necessary info is available
      if (isSundayComplete ) {
          // Iterate over the entries of userPositionMap
          Object.entries(userPositionMap).forEach(([username, position]) => {
              // Dispatch sendUserPositionMap action for each user
              dispatch(
                  sendUserPositionMap({
                      username,
                      results: [{
                          date: new Date(),
                          tournamentName,
                          position,
                      }],
                  })
              );
          });
      }
    }, [isSundayComplete]);

    const today = new Date().toISOString().split('T')[0];

    const topThreeUsersWithEmails = topThreeUsers.map(topUser => {
      // Find the user in the users array with the same username
      const userDetails = users.find(user => user.username === topUser.user.username);
    
      // If userDetails is found, return an object with just username and email
      if (userDetails) {
        return {
          username: topUser.user.username,
          email: userDetails.email,
        };
      }
    
      // If no matching user is found, return the username with a null email
      return {
        username: topUser.user.username,
        email: null,
      };
    });

    const topThreeUsersWithPayouts = topThreeUsersWithEmails.map((user, index) => {
      let payoutAmount = 0;
      if (index === 0) payoutAmount = firstPlacePayout;
      if (index === 1) payoutAmount = secondPlacePayout;
      if (index === 2) payoutAmount = thirdPlacePayout;
      
      return {
        ...user,
        adjustment: payoutAmount,
      };
    });

    const isSunday = true;

    useEffect(() => {
      const balanceUrl = `${process.env.REACT_APP_API_URL}/balance/update-balance`
      if (isSunday && topThreeUsersWithPayouts.length > 0 && shouldFetch) {
        setShouldFetch(false);
        const response = axios.post(balanceUrl, {users: topThreeUsersWithPayouts});
        return response.data
      }
    }, [isSunday, topThreeUsersWithPayouts])

    return (
      <>
        <Paper 
          sx={{ 
            padding: '1rem', 
            marginBottom: '.5rem', 
            borderRadius: '8px',
            backgroundColor: 'LightGray', 
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' 
          }}
        >
              <Typography
                  variant="h4"
                  sx={{
                    backgroundColor: '#222',
                    color: '#FFF',
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 'bold',
                    fontSize: '2rem',
                    textAlign: 'center',
                    padding: '.5rem', 
                    borderRadius: '8px',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
              >
                POOL STANDINGS
              </Typography>
          </Paper>
            <Container >
                <Accordion sx={{backgroundColor: 'green'}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={{
                            display: 'flex',
                         justifyContent: 'center',
                         textAlign: 'center'

                        }}
                    >
                        <Typography sx={{fontFamily: "Rock Salt",}}>Pool Information & Payouts</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <PoolInfo />
                        <Payouts />
                    </AccordionDetails>
                </Accordion>
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
                        <TableCell sx={{ fontSize: '12px' }}><b>Pos</b></TableCell>
                        <TableCell sx={{ fontSize: '12px' }}><b>Player</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R1</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R2</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R3</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>R4</b></TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}><b>Total</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {activeUsers.map((user, index) => {
                        const totalScore =
                          calculateScores(user.username, 'R1') +
                          calculateScores(user.username, 'R2') +
                          calculateScores(user.username, 'R3') +
                          calculateScores(user.username, 'R4');

                        return {
                          user,
                          totalScore,
                        };
                        }).sort((a, b) => a.totalScore - b.totalScore).map(({ user, totalScore }) => (
                          <TableRow key={user._id}>
                            <TableCell sx={{ fontSize: '12px' }}>{userPositionMap[user.username]}</TableCell>
                            <TableCell 
                              onClick={() => handleClick(user)} 
                              style={{cursor: 'pointer', display: 'flex', alignItems: 'center',}}
                            >
                              {user.username}
                              <Avatar src={`${profilePics[user.username]}`} sx={{marginLeft: '.5rem'}}/>
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R1')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R2')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R3')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R4')}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{totalScore}</TableCell>
                          </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
            { currentDay >= 4 || currentDay === 3 ? <GolfersModal user={selectedUser} isOpen={open} handleClose={handleClose}/> : null }
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