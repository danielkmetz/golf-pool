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
import { selectTotalPicks } from '../../Features/myPicksSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { selectLiveResults } from '../../Features/LeaderboardSlice';
import { selectTournamentInfo } from '../../Features/TournamentInfoSlice';
import { selectProfilePics, selectActiveUsers, 
  selectUsers,  
  selectUsername} from '../../Features/userSlice';
import { selectPoolName, selectPoolUsers } from '../../Features/poolsSlice';
import { sortUsers, organizeAndCalculateScores, formatDate } from '../../actions';
import { sendUserPositionMap } from '../../Features/pastResultsSlice';
import { selectUserPoolData } from '../../Features/poolsSlice';
import Payouts from '../Payouts/Payouts';
import PoolInfo from '../PoolInfo/PoolInfo';
import Results from '../Results/Results';
import { fetchWeeklyResults, 
    selectWeeklyResults, 
    fetchUserTotalsForTournaments, 
    selectTotals, 
    duplicateRecordsCheck, 
    selectDuplicates } from '../../Features/pastResultsSlice';
import { batchUpdatePaymentStatus } from '../../Features/paymentStatusSlice';
import WeeklyTotalsMulti from './weeklyTotalsMulti';
import axios from 'axios';


function PoolStandingsMulti() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [open, setOpen] = useState(false);
    const liveResults = useSelector(selectLiveResults);
    const tournamentInfo = useSelector(selectTournamentInfo);
    const poolUsers = useSelector(selectPoolUsers);
    const totalPicks = useSelector(selectTotalPicks);
    const profilePics = useSelector(selectProfilePics)
    const users = useSelector(selectUsers);
    const duplicates = useSelector(selectDuplicates);
    const poolInfo = useSelector(selectUserPoolData);
    const poolName = useSelector(selectPoolName);
    const dispatch = useDispatch();
    const activeUsers = useSelector(selectActiveUsers);
    const [podiumOpen, setPodiumOpen] = useState(false);
    const weeklyResults = useSelector(selectWeeklyResults);
    const totals = useSelector(selectTotals);
    const [defaultWeek, setDefaultWeek] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [showWeeklyTotals, setShowWeeklyTotals] = useState(false);
    const [shouldSavePR, setShouldSavePR] = useState(true);
    const [shouldFetch, setShouldFetch] = useState(true);
    const year = new Date().getFullYear();

    const format = poolInfo.format;
    const numTournaments = poolInfo.numTournaments;
    const tournaments = poolInfo.tournaments;
    const week2DateISO = poolInfo.tournaments?.[1]?.Starts ?? null;
    const week3DateISO = poolInfo.tournaments?.[2]?.Starts ?? null;
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const coursePar = tournamentInfo.Par;
    const week1Tournament = poolInfo?.tournaments?.[0]?.Name ?? null;
    const week2Tournament = poolInfo?.tournaments?.[1]?.Name ?? null;
    const week3Tournament = poolInfo?.tournaments?.[2]?.Name ?? null;
    
    const firstPlacePercentage = poolInfo?.payouts?.[0]?.first || 0;
    const secondPlacePercentage = poolInfo?.payouts?.[0]?.second || 0;
    const thirdPlacePercentage = poolInfo?.payouts?.[0]?.third || 0;
    const buyIn = poolInfo?.buyIn || 0;

    const totalActive = activeUsers.length;
    const firstPlacePayout = Math.floor((totalActive * buyIn) * firstPlacePercentage);
    const secondPlacePayout = Math.floor((totalActive * buyIn) * secondPlacePercentage);
    const thirdPlacePayout = Math.floor((totalActive * buyIn) * thirdPlacePercentage);
    const tournamentName = tournamentInfo?.Name;

    let finalDay;
    if (numTournaments === 2) {
        finalDay = formatDate(week2DateISO, 3);
    } else if (numTournaments === 3) {
        finalDay = formatDate(week3DateISO, 3);
    };

    const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

    const finalDayDate = new Date(finalDay);
    const formattedFinalDate = finalDayDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

    const { organizedData, calculateScores } = useMemo(() => {
        if (totalPicks && liveResults && coursePar && format) {
          return organizeAndCalculateScores(totalPicks, liveResults, coursePar, format, currentDay);
        } else {
          return { organizedData: [], calculateScores: () => null };
        }
      },
      [totalPicks, liveResults, coursePar, format]
    );

    const allGolfersHaveR4Score = useMemo(() => {
        return organizedData.every(golfer => golfer.R4 !== null || golfer.R4 !== undefined);
      }, [organizedData]);

    useEffect(() => {
        dispatch(fetchUserTotalsForTournaments({ tournaments, usernames: activeUsers, year }));
    }, [dispatch, tournaments, activeUsers, allGolfersHaveR4Score]);
    
    const isSundayComplete =
      formattedDate === formattedFinalDate && allGolfersHaveR4Score;
    
    const sendScores = currentDay === 0 && allGolfersHaveR4Score;
    
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

    const sortedUsers = useMemo(() => sortUsers(activeUsers, calculateScores), [activeUsers, calculateScores]);
    const multiSorted = totals?.slice().sort((a, b) => a.totalScore - b.totalScore);
    const topThreeUsers = multiSorted.slice(0, 3);

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
        if (defaultWeek === 0) {
            dispatch(duplicateRecordsCheck({tournamentName: week1Tournament, usernames: activeUsers, year}))
        } else if (defaultWeek === 1) {
          dispatch(duplicateRecordsCheck({tournamentName: week2Tournament, usernames: activeUsers, year}))
        } else {
          dispatch(duplicateRecordsCheck({tournamentName: week3Tournament, usernames: activeUsers, year}))
        }
    }, [dispatch, tournamentName, activeUsers, year, defaultWeek])

    function areAllActiveUsersInResponse({activeUsers, responseData, tournamentName}) {
      return activeUsers.every(user => {
          return responseData.some(data => 
              data.username === user.username && 
              data.results.some(result => result.tournamentName === tournamentName)
          );
      });
    }
    
    const duplicateCheck = areAllActiveUsersInResponse({activeUsers, responseData: duplicates, tournamentName});
    
    useEffect(() => {
        // Check if all necessary info is available
        if (sendScores && !duplicateCheck && shouldSavePR) {
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
                            year,
                            tournamentName,
                            position,
                            scores,
                        }],
                    })
                );
            });
        }
    }, [isSundayComplete]);

    //change week tabs
    const handleTabChange = async (event, newValue) => {
        setActiveTab(newValue);
    
        if (newValue === 'total') {
        try {
            // Dispatch to fetch totals
            setShowWeeklyTotals(true);
        } catch (error) {
            console.error("Error fetching user totals:", error);
            // Handle error if necessary
        }
        } else {
        setShowWeeklyTotals(false);
        
        // Safely access the selected week's name
        const selectedWeekName = tournaments[newValue]?.Name;
        
        if (selectedWeekName) {
            try {
            // Dispatch to fetch weekly results
            await dispatch(fetchWeeklyResults({
                tournamentName: selectedWeekName,
                usernames: poolUsers,
                year: year,
            }));
            } catch (error) {
            console.error("Error fetching weekly results:", error);
            // Handle error if necessary
            }
        } else {
            console.warn("Selected week name is invalid or undefined.");
        }
        }
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

    useEffect(() => {
        if (isSundayComplete) {
          setPodiumOpen(true);
        }
      }, [isSundayComplete]);

    let topThreeUsersWithEmails = [];
    if (topThreeUsers && Array.isArray(topThreeUsers)) {
        topThreeUsersWithEmails = topThreeUsers.map(topUser => {
        // Find the user in the users array with the same username
        const userDetails = users.find(user => user?.username === topUser?.username);
        
        // If userDetails is found, return an object with just username and email
        if (userDetails) {
            return {
            username: topUser?.username,
            email: userDetails.email,
            };
        }
        
        // If no matching user is found, return the username with a null email
        return {
            username: topUser?.username,
            email: null,
        };
        });
    }

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
        if (isSundayComplete && topThreeUsersWithPayouts.length > 0 && shouldFetch) {
        const balanceUrl = `${process.env.REACT_APP_API_URL}/balance/update-balance`;
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
        console.log("Skipping balance update, isSundayComplete:", isSundayComplete);
        }
    }, [isSundayComplete, topThreeUsersWithPayouts]);
    
    // Sort the weeklyResults by totalScore before mapping
    const allResults = (weeklyResults || []).flatMap(weekResult => 
      (weekResult.results || []).map(result => ({ 
          ...result, 
          username: weekResult.username 
      }))
    );
  
    // Sort the flattened results by scores.Total
    const sortedResults = allResults.sort((a, b) => {
        const totalScoreA = a.scores.Total || 0;
        const totalScoreB = b.scores.Total || 0;
        return totalScoreA - totalScoreB;
    });
    
    useEffect(() => {
        if (isSundayComplete && poolName && userPositionMap) {
          const usernamesArray = Object.keys(userPositionMap);
          dispatch(batchUpdatePaymentStatus({poolName: poolName, usernames: usernamesArray}));
        }
      }, [isSundayComplete, poolName, userPositionMap]);

    return (
      <>
        <Paper 
          sx={{ 
            padding: '1rem', 
            marginBottom: '.5rem', 
            borderRadius: '8px',
            backgroundColor: 'LightGray', 
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            mt: '2.5rem', 
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
                    sortedResults.map((result, index) => {
                        
                        return (
                        <TableRow key={result._id}>
                            <TableCell sx={{ fontSize: '12px' }}>{result.position}</TableCell>
                            <TableCell
                                onClick={() => handleClick({ username: result.username })}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {result.username}
                                <Avatar src={`${profilePics[result.username]}`} sx={{ marginLeft: '.5rem' }} />
                            </TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R1 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R2 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R3 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.R4 || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '12px', paddingLeft: '.5px' }}>{result.scores.Total}</TableCell>
                        </TableRow>
                        );
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

