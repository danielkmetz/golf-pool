import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, Button, Tooltip, CircularProgress } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrentPicks from './currentPicks'; 
import { fetchUserPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllPicks, deleteUserPicks } from '../../Features/myPicksSlice';
import ChangeInfoModal from './ChangeInfoModal';
import { fetchEmail, 
    selectEmail, 
    fetchProfilePic, 
    selectProfilePic, 
    uploadProfilePic, 
    updateUsername, 
    updateUsernameMyPicks,
    updateUsernamePool,
    setUsername,
    selectUsername,
    fetchUsername,
 } from '../../Features/userSlice';

function Profile() {
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail);
    const [loading, setLoading] = useState(true);
    const userPhoto = useSelector(selectProfilePic);
    const [imagePreview, setImagePreview] = useState('');
    const allUserPicks = useSelector(selectAllPicks);
    const [tier1Picks, setTier1Picks] = useState([]);
    const [tier2Picks, setTier2Picks] = useState([]);
    const [tier3Picks, setTier3Picks] = useState([]);
    const [tier4Picks, setTier4Picks] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const dispatch = useDispatch();

    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const isSubmitDisabled = currentDay >= 4 || currentDay === 0;

    useEffect(() => {
        dispatch(fetchUsername());
    }, [dispatch, newUsername, username]);

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

    const handleDeletePicks = () => {
        dispatch(deleteUserPicks({ username }));
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };
    
    const handleCloseModal = () => {
        setOpenModal(false);
    };
    
    const handleChangeUsername = (event) => {
        setNewUsername(event.target.value);
    };

    const token = localStorage.getItem('token');
    
    const handleSubmitUsername = () => {
        // Trim the new username before dispatching the actions
        const trimmedUsername = newUsername.trim();
        // Send the updated username to your backend route for updating user data
        dispatch(updateUsername({ username, newUsername: trimmedUsername, token }));
        dispatch(updateUsernameMyPicks({ username, newUsername: trimmedUsername }));
        dispatch(updateUsernamePool({ username, newUsername: trimmedUsername }));
        handleCloseModal();
    
        setTimeout(() => {
            dispatch(setUsername(trimmedUsername));
        }, 1000);
    };

    const handleFileChange = (event) => {
        const image = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        }
        if (image) {
            reader.readAsDataURL(image);
        }
        if (image) {
            dispatch(uploadProfilePic({
                image: image,
                username: username
            }));
        }
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
                        height: '240px',
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
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="upload-photo"
                        />
                        <label htmlFor="upload-photo">
                            <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                                <Avatar sx={{ bgcolor: 'secondary.main', width: 100, height: 100 }} src={imagePreview || userPhoto}>
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
                        <Button variant="contained" color="error" disabled={isSubmitDisabled} onClick={handleDeletePicks}>
                            Delete Picks
                        </Button>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleOpenModal}
                            sx={{
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                }
                            }}
                        >
                            Change Username
                        </Button>
                        <ChangeInfoModal
                            open={openModal}
                            onClose={handleCloseModal}
                            newUsername={newUsername}
                            handleChangeUsername={handleChangeUsername}
                            handleSubmitUsername={handleSubmitUsername}
                        />
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

export default Profile;
