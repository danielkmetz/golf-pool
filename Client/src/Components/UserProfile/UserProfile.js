import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, Tooltip, CircularProgress, Tabs, Tab, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrentPicks from '../Profile/currentPicks'; 
import { fetchUserPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPicks,} from '../../Features/myPicksSlice';
import { fetchEmail, 
    selectEmail, fetchProfilePic, selectProfilePic } from '../../Features/userSlice';
import { useParams } from 'react-router';
import PastResults from '../Profile/PastResults';

function UserProfile() {
    const {username} = useParams();
    const email = useSelector(selectEmail);
    const userPhoto = useSelector(selectProfilePic);
    const [loading, setLoading] = useState(true);
    const allUserPicks = useSelector(selectAllPicks);
    const [tier1Picks, setTier1Picks] = useState([]);
    const [tier2Picks, setTier2Picks] = useState([]);
    const [tier3Picks, setTier3Picks] = useState([]);
    const [tier4Picks, setTier4Picks] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const dispatch = useDispatch();

    console.log(username)

    useEffect(() => {
        setLoading(true)
        if (username) {
            dispatch(fetchUserPicks(username));
            dispatch(fetchEmail(username));
            dispatch(fetchProfilePic(username))
            setLoading(false)
        }
    }, [dispatch, username, email]);

    useEffect(() => {
        if (allUserPicks && allUserPicks.length > 0) {
            const tier1PicksArray = allUserPicks[0].golferName.map(name => name);
            const tier2PicksArray = allUserPicks[1].golferName.map(name => name);
            const tier3PicksArray = allUserPicks[2].golferName.map(name => name);
            const tier4PicksArray = allUserPicks[3].golferName.map(name => name);
            setTier1Picks(tier1PicksArray);
            setTier2Picks(tier2PicksArray);
            setTier3Picks(tier3PicksArray);
            setTier4Picks(tier4PicksArray);
        }
    }, [allUserPicks]);

    // Function to check if the current date is before Thursday
    const isBeforeThursday = () => {
        const currentDate = new Date();
        const dayOfWeek = currentDate.getDay();
        return dayOfWeek < 4 || dayOfWeek === 0;
    };

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleTabChange = (value) => {
        setTabValue(value);
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            '@media (max-width: 600px)': {
                flexWrap: 'wrap',
                flexDirection: 'column',
                marginTop: '1rem',
            },  
        }}>
            {/* Profile Info Box */}
            <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                '@media (min-width: 600px)': {
                    flexDirection: 'row',
                },
            }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Paper elevation={3} sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '180px',
                        backgroundColor: "#DEB887",
                        marginTop: '2rem',
                        '@media (min-width: 600px)': {
                            position: 'sticky',
                            top: '20px',
                            zIndex: 1,
                        },
                        '@media (max-width: 600px)': {
                            width: '50%',
                            
                        },
                    }}>
                        <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 100, height: 100 }} src={userPhoto}>
                                {!userPhoto && <AccountCircleIcon />}
                            </Avatar>
                            {!userPhoto && (
                                <Tooltip title="Upload Profile Picture">
                                    <HelpOutlineIcon sx={{
                                        position: 'absolute', bottom: 0, left: '-15px' }} />
                                </Tooltip>
                            )}
                        </Box>
                        <Typography variant="h5" component="h1" gutterBottom>
                            {username}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            {email}
                        </Typography>
                    </Paper>
                )}
            </Box>

            {/* Main Content */}
            <Box sx={{ width: '60%', '@media (max-width: 600px)': {
                            marginTop: '2rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                        },}}>
                <Box>
                    <Tabs
                        value={tabValue}
                        onChange={handleChangeTab}
                        TabIndicatorProps={{
                            style: {
                                backgroundColor: 'green',
                                height: '8px' // Adjust the height value to make the line thicker
                            }
                        }}
                        sx={{
                            marginLeft: '13rem',
                            height: '.75rem',
                            '@media (max-width: 600px)': {
                                        marginLeft: '2rem',
                                    },
                            '@media (max-width: 1400px)': {
                                        marginLeft: '8rem',
                                    }
                        }}
                    >
                        <Button 
                            variant="contained"
                            onClick={() => handleTabChange(0)}
                            sx={{
                                backgroundColor: '#222',
                    
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                },
                                '@media (max-width: 600px)': {
                                        width: '29%',
                                        height: '2rem',
                                        marginTop: '20px',
                                    }
                            }}
                        >
                            <Tab label="Current Picks"
                                sx={{
                                    '@media (max-width: 600px)': {
                                        fontSize: '11px',
                                    }
                                }}
                            />
                        </Button>
                        <Button 
                            variant="contained"
                            sx={{
                                marginLeft: '1rem',
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                },
                                '@media (max-width: 600px)': {
                                        width: '29%',
                                        height: '2rem',
                                        marginTop: '20px',
                                    }
                            }}
                            onClick={() => handleTabChange(1)}
                        >
                            <Tab label="Past Results"
                                sx={{
                                    '@media (max-width: 600px)': {
                                        fontSize: '11px',
                                    }
                                }}
                            />
                        </Button>
                    </Tabs>
                    {tabValue === 0 && (
                    <CurrentPicks
                        tier1Picks={isBeforeThursday() ? tier1Picks.map(() => 'Blurred Name') : tier1Picks}
                        tier2Picks={isBeforeThursday() ? tier2Picks.map(() => 'Blurred Name') : tier2Picks}
                        tier3Picks={isBeforeThursday() ? tier3Picks.map(() => 'Blurred Name') : tier3Picks}
                        tier4Picks={isBeforeThursday() ? tier4Picks.map(() => 'Blurred Name') : tier4Picks}
                        allPicks={allUserPicks}
                    />
                    )}
                    {tabValue === 1 && (
                        <PastResults username={username}/>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default UserProfile;

            // <Box sx={{ 
            //     width: '60%',
            //     '@media (max-width: 600px)' : {
            //         marginTop: '2rem',
            //         display: 'flex',
            //         justifyContent: 'center',
            //         alignItems: 'center',
            //         width: '100%',
            //     } 
            //     }}>
            //     <CurrentPicks
            //         tier1Picks={isBeforeThursday() ? tier1Picks.map(() => 'Blurred Name') : tier1Picks}
            //         tier2Picks={isBeforeThursday() ? tier2Picks.map(() => 'Blurred Name') : tier2Picks}
            //         tier3Picks={isBeforeThursday() ? tier3Picks.map(() => 'Blurred Name') : tier3Picks}
            //         tier4Picks={isBeforeThursday() ? tier4Picks.map(() => 'Blurred Name') : tier4Picks}
            //         allPicks={allUserPicks}
            //     />
            // </Box>