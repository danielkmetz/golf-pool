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
  AccordionDetails 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GolfersModal from './golfersModal';
import { useSelector, useDispatch } from 'react-redux';
import { selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { selectLiveResults } from '../../Features/LeaderboardSlice';
import { selectUserPoolData, updateRoundDay, selectRoundDay, selectPoolName } from '../../Features/poolsSlice';
import { selectTotalPicks } from '../../Features/myPicksSlice';
import { duplicateRecordsCheck, selectDuplicates, sendUserPositionMap } from '../../Features/pastResultsSlice';
import { selectActiveUsers, selectProfilePics, selectUsers } from '../../Features/userSlice';
import { sortUsers, organizeAndCalculateScores, areAllActiveUsersInResponse } from '../../actions';
import Payouts from '../Payouts/Payouts';
import PoolInfo from '../PoolInfo/PoolInfo';
import Results from '../Results/Results';
import { batchUpdatePaymentStatus } from '../../Features/paymentStatusSlice';

function PoolStandingsRound() {
  const dispatch = useDispatch();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [podiumOpen, setPodiumOpen] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(true);
  const [shouldSavePR, setShouldSavePR] = useState(true);
  const [allRoundScores, setAllRoundScores] = useState(null);

  const liveResults = useSelector(selectLiveResults);
  const users = useSelector(selectUsers);
  const tournamentInfo = useSelector(selectTournamentInfo);
  const totalPicks = useSelector(selectTotalPicks);
  const profilePics = useSelector(selectProfilePics);
  const poolInfo = useSelector(selectUserPoolData);
  const activeUsers = useSelector(selectActiveUsers);
  const duplicates = useSelector(selectDuplicates);
  const roundDay = useSelector(selectRoundDay);
  const poolName = useSelector(selectPoolName);
  
  const format = poolInfo?.format;
  const round = poolInfo?.round;
  
  const firstPlacePercentage = poolInfo?.payouts?.[0]?.first || 0;
  const secondPlacePercentage = poolInfo?.payouts?.[0]?.second || 0;
  const thirdPlacePercentage = poolInfo?.payouts?.[0]?.third || 0;
  const buyIn = poolInfo?.buyIn || 0;

  const totalActive = activeUsers?.length;
  const firstPlacePayout = Math.floor((totalActive * buyIn) * firstPlacePercentage);
  const secondPlacePayout = Math.floor((totalActive * buyIn) * secondPlacePercentage);
  const thirdPlacePayout = Math.floor((totalActive * buyIn) * thirdPlacePercentage);

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const currentDay = currentDate.getDay();
  const coursePar = tournamentInfo?.Par;
  const tournamentName = tournamentInfo?.Name;
  
  const { organizedData, calculateScores } = useMemo(() => {
    if (totalPicks && liveResults && coursePar && format) {
      return organizeAndCalculateScores(totalPicks, liveResults, coursePar, format);
    } else {
      return { organizedData: [], calculateScores: () => null };
    }
  }, [totalPicks, liveResults, coursePar, format]);
  
  const allGolfersHaveR4Score = useMemo(() => {
    return organizedData.every((golfer) => golfer.R4 !== null && golfer.R4 !== undefined);
  }, [organizedData]);

  const allGolfersHaveR1Score = useMemo(() => {
    return organizedData.every((golfer) => golfer.R1 !== null && golfer.R1 !== undefined);
  }, [organizedData]);

  const allGolfersHaveR2Score = useMemo(() => {
    return organizedData.every((golfer) => golfer.R2 !== null && golfer.R2 !== undefined);
  }, [organizedData]);

  const allGolfersHaveR3Score = useMemo(() => {
    return organizedData.every((golfer) => golfer.R3 !== null && golfer.R3 !== undefined);
  }, [organizedData]);

  //Identify the day of the round and which round of golfscores should trigger the round completion
  useEffect(() => {
    if (round) {
        dispatch(updateRoundDay({round}));

        if (round === "Opening Day") {
            setAllRoundScores(allGolfersHaveR1Score);
        } else if (round === "Packing Day") {
            setAllRoundScores(allGolfersHaveR2Score);
        } else if (round === "Moving Day") {
            setAllRoundScores(allGolfersHaveR3Score);
        } else {
            setAllRoundScores(allGolfersHaveR4Score);
        };
    }
  }, [round, allGolfersHaveR1Score, allGolfersHaveR2Score, allGolfersHaveR3Score, allGolfersHaveR4Score]);
  
  const isRoundComplete = currentDay === roundDay && allRoundScores;

  useEffect(() => {
    setPodiumOpen(isRoundComplete);
  }, [isRoundComplete]);

  const sortedUsers = useMemo(() => sortUsers(activeUsers, calculateScores), [activeUsers, calculateScores]);

  const topThreeUsers = sortedUsers.slice(0, 3);

  const userPositionMap = useMemo(() => {
    return sortedUsers.reduce((acc, user, index, array) => {
      let position = index + 1;
      if (index > 0 && user.totalScore === array[index - 1].totalScore) {
        position = `T${position}`;
      }
      acc[user.user.username] = position;
      return acc;
    }, {});
  }, [sortedUsers]);

  useEffect(() => {
    dispatch(duplicateRecordsCheck({ tournamentName, usernames: activeUsers, year }));
  }, [activeUsers, tournamentName, year]);

  const duplicateCheck = areAllActiveUsersInResponse({activeUsers, responseData: duplicates, tournamentName});

  //send scores to database
  useEffect(() => {
    // Check if all necessary info is available
    if (isRoundComplete && !duplicateCheck && shouldSavePR) {
      // Iterate over the entries of userPositionMap
      Object.entries(userPositionMap).forEach(([username, position]) => {
        const scores = {
          R1: roundDay === 4 ? calculateScores(username, 'R1') : null,
          R2: roundDay === 5 ? calculateScores(username, 'R2') : null,
          R3: roundDay === 6 ? calculateScores(username, 'R3') : null,
          R4: roundDay === 0 ? calculateScores(username, 'R4') : null,
        };

        scores.Total = scores.R1 + scores.R2 + scores.R3 + scores.R4;
        // Dispatch sendUserPositionMap action for each user
        dispatch(
          sendUserPositionMap({
            username,
            results: [
              {
                year: year,
                tournamentName,
                position,
                scores,
              },
            ],
          })
        );
        setShouldSavePR(false);
      })
    }
  }, [isRoundComplete, duplicateCheck]);
  
  const handleClick = (user) => {
    setSelectedUser(user.username);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedUser(null);
    setOpen(false);
  };

  const handlePodiumClose = () => {
    setPodiumOpen(false);
  };

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

//update user balances
useEffect(() => {
  if (isRoundComplete && topThreeUsersWithPayouts.length > 0 && shouldFetch) {
    const balanceUrl = `${process.env.EXPO_PUBLIC_API_URL}/balance/update-balance`;
    setShouldFetch(false);
    
    // Wrap the API call in an async function
    const updateBalance = async () => {
      try {
        const response = await axios.post(balanceUrl, { users: topThreeUsersWithPayouts });
        console.log("Balance updated:", response.data);
      } catch (error) {
        console.error("Error updating balance:", error);
      }
    };
    
    updateBalance(); // Call the async function

  } else {
    console.log("Skipping balance update, isRoundComplete:", isRoundComplete);
  }
}, [isRoundComplete, topThreeUsersWithPayouts]);

//set payment user's payment status back to false 
useEffect(() => {
    if (roundDay === currentDay && poolName & userPositionMap) {
      const usernamesArray = Object.keys(userPositionMap);
      dispatch(batchUpdatePaymentStatus({poolName: poolName, usernames: usernamesArray}));
    }
  }, [roundDay, currentDay, poolName, userPositionMap])

  return (
    <>
      <Paper 
        sx={{ 
          padding: '1rem', 
          marginBottom: '.5rem', 
          borderRadius: '8px',
          backgroundColor: 'LightGray', 
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          mt: '2.5rem' 
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

      <Container>
        <Accordion sx={{ backgroundColor: 'green' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{ justifyContent: 'center', textAlign: 'center' }}
          >
            <Typography sx={{ fontFamily: "Rock Salt" }}>Pool Information & Payouts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <PoolInfo />
            <Payouts />
          </AccordionDetails>
        </Accordion>
      </Container>

      <TableContainer sx={{ maxHeight: '600px' }}>
        <Table >
          <TableHead sx={{ backgroundColor: "#ffebcd", position: 'sticky' }}>
            <TableRow >
              <TableCell sx={{ fontSize: '12px' }}><b>Pos</b></TableCell>
              <TableCell sx={{ fontSize: '12px' }}><b>Player</b></TableCell>
              <TableCell sx={{ fontSize: '12px' }}><b>{round} Score</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((item) => {
              
              const formatScore = (score) => {
                if (score === null) return '';
                if (score === 0) return 'E';
                return score > 0 ? `+${score}` : `${score}`;
              };

              return (
                <TableRow key={item.user.username}>
                  <TableCell sx={{ fontSize: '12px' }}>{userPositionMap[item.user.username]}</TableCell>
                  <TableCell 
                    onClick={() => handleClick(item.user)}
                    disabled={currentDay !== roundDay} 
                    sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {item.user.username}
                    <Avatar src={profilePics[item.user.username]} sx={{ marginLeft: '.5rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '12px' }}>
                    {
                        roundDay === 4 ? 
                        formatScore(calculateScores(item.user.username, 'R1')) :
                        roundDay === 5 ?
                        formatScore(calculateScores(item.user.username, 'R2')) :
                        roundDay === 6 ?
                        formatScore(calculateScores(item.user.username, 'R3')) :
                        roundDay === 0 ?
                        formatScore(calculateScores(item.user.username, 'R4')) : null
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <GolfersModal 
        user={selectedUser} 
        isOpen={open} 
        handleClose={handleClose} 
        format={poolInfo.format} 
        coursePar={tournamentInfo?.Par} 
      />

      {podiumOpen && topThreeUsers.length > 0 && (
        <Results 
          podiumOpen={podiumOpen} 
          handlePodiumClose={handlePodiumClose} 
          topThreeUsers={topThreeUsers} 
        />
      )}
    </>
  );
}

export default PoolStandingsRound;
