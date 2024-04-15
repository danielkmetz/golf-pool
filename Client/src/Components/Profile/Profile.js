import React, {useState, useEffect} from 'react';
import { Box, Avatar, Typography, Paper, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrentPicks from './currentPicks'; // Assuming this is your component for displaying picks
import {jwtDecode} from 'jwt-decode';
import { fetchUserPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPicks, deleteUserPicks } from '../../Features/myPicksSlice';
//import Test from '../../Utils/test';


function Profile() {
    const [username, setUsername] = useState('');
    const allUserPicks = useSelector(selectAllPicks);
    const [allPicks, setAllPicks] = useState([])
    const [tier1Picks, setTier1Picks] = useState([]);
    const [tier2Picks, setTier2Picks] = useState([]);
    const [tier3Picks, setTier3Picks] = useState([]);
    const [tier4Picks, setTier4Picks] = useState([]);
    const dispatch = useDispatch();
 
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken) {
                setUsername(decodedToken.username);
            }
        }
    }, []);
    
    useEffect(() => {
        if (username) {
            dispatch(fetchUserPicks(username));
        }
    }, [dispatch, username]);
    
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
    
    const handleDeletePicks = () => {
        dispatch(deleteUserPicks({username}));
    }

    return (
        <Box sx={{ position: 'relative', maxWidth: 'lg', margin: 'auto' }}>
            {/* Profile Info Box with absolute positioning */}
            <Paper elevation={3} sx={{
                position: 'absolute',
                left: 0,
                transform: 'translateX(-50%)',
                top: '20px',
                width: 'fit-content',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 1, // Ensure it's above other content
                backgroundColor: "#DEB887"
            }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <AccountCircleIcon />
                </Avatar>
                <Typography variant="h5" component="h1" gutterBottom>
                    {username}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    dkmetz18@gmail.com
                </Typography>
                <Button variant="contained" color="error" onClick={handleDeletePicks}>
                    Delete My Picks
                </Button>
            </Paper>

            {/* Main Content - Adjust margin to ensure content doesn't overlap with the profile box */}
            <Box sx={{ 
                mt: 1, 
                ml: { sm: '200px', xs: '150px'},
                }}> 
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

export default Profile;
