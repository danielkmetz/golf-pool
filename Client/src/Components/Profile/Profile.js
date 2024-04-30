import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, Button, Tooltip, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrentPicks from './currentPicks'; 
import { jwtDecode } from 'jwt-decode';
import { fetchUserPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPicks, deleteUserPicks } from '../../Features/myPicksSlice';
import axios from 'axios';

function Profile() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [userPhoto, setUserPhoto] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [file, setFile] = useState(null);
    const allUserPicks = useSelector(selectAllPicks);
    const [tier1Picks, setTier1Picks] = useState([]);
    const [tier2Picks, setTier2Picks] = useState([]);
    const [tier3Picks, setTier3Picks] = useState([]);
    const [tier4Picks, setTier4Picks] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        setLoading(true)
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            if (decodedToken) {
                setUsername(decodedToken.username);
                setLoading(false)
            }
        }
    }, []);

    useEffect(() => {
        setLoading(true)
        if (username) {
            dispatch(fetchUserPicks(username));
            setLoading(false)
        }
    }, [dispatch, username]);

    useEffect(() => {
        const fetchEmail = async () => {
            setLoading(true)
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/users/email/${username}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user email');
                  }
                const data = await response.json();
                setEmail(data.email);
            } catch (error) {
                console.error('Error fetching user email:', error);
            } finally {
                setLoading(false)
            }
        };

        const fetchProfilePic = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile-pics/${username}`, {
                    responseType: 'arrayBuffer',
                });
                setUserPhoto(response.data);
            } catch (error) {
                console.error('Error fetching profile picture:', error);
            }
        };

        fetchProfilePic();
        fetchEmail();
    }, [email, username, profilePicUrl]);

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
        dispatch(deleteUserPicks({ username }));
    };

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setUserPhoto(reader.result);
        }
        if (selectedFile) {
            reader.readAsDataURL(selectedFile);
        }
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('username', username);
        
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/profile-pics`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            alert('Error uploading profile picture. Please try again.');
        }
    };
    
    
    return (
        <Box sx={{ position: 'relative', maxWidth: 'lg', margin: 'auto' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
            <>
            {/* Profile Info Box */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                mt: 2 
            }}>
                <Paper elevation={3} sx={{
                    width: '20%',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: "#DEB887",
                    '@media (min-width: 600px)': {
                        position: 'absolute',
                        left: 0,
                        transform: 'translateX(-50%)',
                        top: '20px',
                        zIndex: 1,
                    },
                    '@media (max-width: 600px)': {
                        width: '40%',
                    },
                }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        id="upload-photo"
                    />
                    <label htmlFor="upload-photo">
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
                    </label>
                    <Typography variant="h5" component="h1" gutterBottom>
                        {username}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {email}
                    </Typography>
                    <Button variant="contained" color="error" onClick={handleDeletePicks}>
                        Delete My Picks
                    </Button>
                </Paper>
            </Box>

            {/* Main Content */}
            <Box sx={{ mt: 2 }}>
                <CurrentPicks
                    tier1Picks={tier1Picks}
                    tier2Picks={tier2Picks}
                    tier3Picks={tier3Picks}
                    tier4Picks={tier4Picks}
                    allPicks={allUserPicks}
                />
            </Box>
            </>
            )}
        </Box>
    );
}

export default Profile;
