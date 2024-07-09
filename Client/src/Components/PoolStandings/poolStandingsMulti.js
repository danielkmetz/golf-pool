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
    Tab,
    Tabs,
    Accordion,
    AccordionSummary,
    AccordionDetails,
  } from '@mui/material';
import GolfersModal from './golfersModal';
import { fetchTotalPicks, selectTotalPicks } from '../../Features/myPicksSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { selectLiveResults } from '../../Features/LeaderboardSlice';
import { selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { selectProfilePics, selectActiveUsers, 
  selectUsers, fetchProfilePics, 
  fetchUsersWithPicks, selectUsername} from '../../Features/userSlice';
import { selectPoolUsers } from '../../Features/poolsSlice';
import { getRoundScore, sortUsers, } from '../../actions';
import { sendUserPositionMap } from '../../Features/pastResultsSlice';
import { selectUserPoolData } from '../../Features/poolsSlice';
import Payouts from '../Payouts/Payouts';
import PoolInfo from '../PoolInfo/PoolInfo';
import Results from '../Results/Results';
import { fetchWeeklyResults, 
    selectWeeklyResults } from '../../Features/pastResultsSlice';
import WeeklyTotalsMulti from './weeklyTotalsMulti';

function PoolStandingsMulti() {
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
    const weeklyResults = useSelector(selectWeeklyResults);
    const [defaultWeek, setDefaultWeek] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [showWeeklyTotals, setShowWeeklyTotals] = useState(false);
    
    const format = poolInfo.format;
    const numTournaments = poolInfo.numTournaments;
    const tournaments = poolInfo.tournaments;
    const week1DateISO = poolInfo.tournaments?.[0]?.Starts ?? null;
    const week2DateISO = poolInfo.tournaments?.[1]?.Starts ?? null;
    const week3DateISO = poolInfo.tournaments?.[2]?.Starts ?? null;
    const week1Name = tournaments?.[0]?.Name ?? null;
    const week2Name = tournaments?.[1]?.Name ?? null;
    const week3Name = tournaments?.[2]?.Name ?? null;
    
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const coursePar = tournamentInfo.Par;
    const tournamentName = tournamentInfo.Name;

    const formatDate = (isoDate, addDays = 0) => {
        if (!isoDate) return null; // Handle cases where isoDate is null or undefined
    
        const date = new Date(isoDate);
        date.setDate(date.getDate() + addDays); // Add the specified number of days
    
        const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };
    
    const week1Date = formatDate(week1DateISO);
    const week2Date = formatDate(week2DateISO);
    const week3Date = formatDate(week3DateISO);

    let finalDay;
    if (numTournaments === 2) {
        finalDay = formatDate(week2DateISO, 3);
    } else if (numTournaments === 3) {
        finalDay = formatDate(week3DateISO, 3);
    }

    const finalDayDate = new Date(finalDay);
    const currentDayDate = new Date(currentDay);

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
    
          if (format === "Salary Cap" || format === "Multi-Week Salary Cap") {
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
      currentDayDate.toDateString() === finalDayDate.toDateString() && allGolfersHaveR4Score;
  
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
          position = `T${position}`;
      }
      acc[user.user.username] = position;
      return acc;
    }, {});

    useEffect(() => {
      // Check if all necessary info is available
      if (isSundayComplete ) {
          // Iterate over the entries of userPositionMap
          Object.entries(userPositionMap).forEach(([username, position]) => {

            const scores = {
                R1: calculateScores(username, 'R1'),
                R2: calculateScores(username, 'R2'),
                R3: calculateScores(username, 'R3'),
                R4: calculateScores(username, 'R4'),
            };

            scores.Total = scores.R1 + scores.R2 + scores.R3 + scores.R4;
              
              // Dispatch sendUserPositionMap action for each user
              dispatch(
                  sendUserPositionMap({
                      username,
                      results: [{
                          date: new Date(),
                          tournamentName,
                          position,
                          scores,
                      }],
                  })
              );
          });
      }
    }, [isSundayComplete]);

    const handleTabChange = async (event, newValue) => {
        setActiveTab(newValue);
        
        if (newValue === 'total') {
            setShowWeeklyTotals(true);
        } else {
            setShowWeeklyTotals(false);
        }

        const selectedWeekName = tournaments[newValue]?.Name;
        const selectedWeekDate = formatDate(tournaments[newValue]?.Starts);

        await dispatch(fetchWeeklyResults({
            tournamentName: selectedWeekName,
            usernames: activeUsers,
            date: selectedWeekDate
        }));
    };

    useEffect(() => {
        const defaultWeekIndex = tournaments.findIndex(week => week.Name === tournamentName);
        if (defaultWeekIndex !== -1 && defaultWeekIndex < tournaments.length) {
            setActiveTab(defaultWeekIndex);
            setDefaultWeek(defaultWeekIndex);
        } else {
            setActiveTab(0); // Ensure it does not default to the Total tab
            setDefaultWeek(0);
        }
    }, [tournamentName, tournaments]);

    return (
      <>
        <Paper 
          sx={{ 
            padding: '1rem', 
            marginBottom: '.5rem', 
            borderRadius: '8px',
            backgroundColor: 'LightGray', 
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' 
          }}>
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
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              indicatorColor="primary" // Ensure indicatorColor is set to "primary"
              textColor="primary" // Ensure textColor is set to "primary"
              sx={{
                  '& .MuiTabs-indicator': {
                      backgroundColor: 'green', // Set the background color of the active underline to green
                  },
                  '& .Mui-selected': {
                      color: 'green', // Set the text color of the selected Tab to green
                      borderColor: 'green', // Set the outline color of the selected Tab to green
                  },
              }}>
              {Array.from({ length: numTournaments }, (_, index) => (
                  <Tab 
                    key={index} 
                    label={`Week ${index + 1}`} 
                    sx={{
                        '&.Mui-selected': {
                            color: 'green', // Set the text color of the selected Tab to green
                            borderColor: 'green', // Set the outline color of the selected Tab to green
                        },
                    }}
                    />
              ))}
              <Tab 
                label="Total" 
                value="total"
                sx={{
                    '&.Mui-selected': {
                        color: 'green', // Set the text color of the selected Tab to green
                        borderColor: 'green', // Set the outline color of the selected Tab to green
                    },
                }} 
                />
          </Tabs>
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
            {showWeeklyTotals ? (
            <WeeklyTotalsMulti 
                tournaments={tournaments} 
                numTournaments={numTournaments}
                profilePics={profilePics} 
                usernames={activeUsers}/>
            ) :  (
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
                {activeTab === defaultWeek ? (
                    // Render default week data
                    activeUsers.map((user, index) => {
                    const totalScore =
                        (calculateScores(user.username, 'R1') || 0) +
                        (calculateScores(user.username, 'R2') || 0) +
                        (calculateScores(user.username, 'R3') || 0) +
                        (calculateScores(user.username, 'R4') || 0);

                    return (
                        <TableRow key={user._id}>
                        <TableCell sx={{ fontSize: '12px' }}>{userPositionMap[user.username]}</TableCell>
                        <TableCell
                            onClick={() => handleClick(user)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            {user.username}
                            <Avatar src={`${profilePics[user.username]}`} sx={{ marginLeft: '.5rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R1') || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R2') || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R3') || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{calculateScores(user.username, 'R4') || '-'}</TableCell>
                        <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{totalScore}</TableCell>
                        </TableRow>
                    );
                    })
                ) : (
                    // Render fetched week data
                    weeklyResults.map((weekResult, weekIndex) => {
                    return weekResult.results.map((result, userIndex) => {
                        if (!result) return null;

                        const totalScore =
                        (result.scores.R1 || 0) +
                        (result.scores.R2 || 0) +
                        (result.scores.R3 || 0) +
                        (result.scores.R4 || 0);

                        return (
                        <TableRow key={`${weekIndex}-${userIndex}`}>
                            <TableCell sx={{ fontSize: '12px' }}>{result.position}</TableCell>
                            <TableCell
                                onClick={() => handleClick({ username: weekResult.username })}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {weekResult.username}
                                <Avatar src={`${profilePics[weekResult.username]}`} sx={{ marginLeft: '.5rem' }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R1 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R2 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R3 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R4 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{totalScore}</TableCell>
                        </TableRow>
                        );
                    });
                    })
                )}
                </TableBody>
            </Table>
                { currentDay >= 4 || currentDay === 0 ? 
                    <GolfersModal user={selectedUser} isOpen={open} handleClose={handleClose}/> : null }
            </TableContainer>
                )}
          <Results
            podiumOpen={podiumOpen}
            handlePodiumClose={handlePodiumClose}
            topThreeUsers={topThreeUsers}
        />
      </>
    );
}

export default PoolStandingsMulti;

