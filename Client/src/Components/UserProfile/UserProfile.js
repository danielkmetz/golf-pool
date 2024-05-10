import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, Tooltip, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrentPicks from '../Profile/currentPicks'; 
import { fetchUserPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPicks,} from '../../Features/myPicksSlice';
import { fetchEmail, 
    selectEmail, fetchProfilePic, selectProfilePic } from '../../Features/userSlice';
import { useParams } from 'react-router';


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
    const dispatch = useDispatch();

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
            <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                '@media (min-width: 600px)': {
                    flexDirection: 'row',
                },
                }}>
                {/* Profile Info Box */}
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
                <CurrentPicks
                    tier1Picks={tier1Picks}
                    tier2Picks={tier2Picks}
                    tier3Picks={tier3Picks}
                    tier4Picks={tier4Picks}
                    allPicks={allUserPicks}
                />
            </Box>
        </Box>
    );
}

export default UserProfile;
