import React, { useState, useEffect } from 'react';
import { Box, Avatar, Typography, Paper, Button, Tooltip, CircularProgress, Tab, Tabs, Snackbar, Alert, Modal } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CurrentPicks from './currentPicks'; 
import { fetchUserPicks } from '../../Features/myPicksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { resetPoolName, resetPoolUsers, resetUserPoolData, selectPoolName, selectUserPoolData } from '../../Features/poolsSlice';
import { selectAllPicks, deleteUserPicks, resetAllPicks } from '../../Features/myPicksSlice';
import ChangeInfoModal from './ChangeInfoModal';
import MyPool from './MyPool';
import PastResults from './PastResults';
import { fetchEmail, 
    selectEmail, 
    fetchProfilePic, 
    selectProfilePic, 
    uploadProfilePic, 
    updateUsername, 
    updateUsernameMyPicks,
    updateUsernamePool,
    updateUsernamePastResults,
    updateUsernameChats,
    resetActiveUsers,
    selectUsername,
    fetchUsername,
    setUsername,
    selectLoggedIn,
 } from '../../Features/userSlice';
import { fetchPastResults } from '../../Features/pastResultsSlice';
import { getAccountBalance, selectUserBalance, changeUsernameAccountBalance, resetBalance } from '../../Features/balanceSlice';
import AccountBalance from './AccountBalance';
import DeleteUser from './DeleteUser';
import { useNavigate } from 'react-router';

function Profile() {
    const username = useSelector(selectUsername);
    const email = useSelector(selectEmail);
    const info = useSelector(selectUserPoolData);
    const balance = useSelector(selectUserBalance);
    const poolName = useSelector(selectPoolName);
    const userBalance = useSelector(selectUserBalance);
    const isLoggedIn = useSelector(selectLoggedIn);
    const format = info.format;
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(poolName ? 0 : 1);
    const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const isSubmitDisabled = currentDay >= 4 || currentDay === 0;

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tournamentInfoCache');
        localStorage.removeItem('geoCodeCache');
        localStorage.removeItem('weatherCache');
        dispatch(resetPoolName());
        dispatch(resetPoolUsers());
        dispatch(resetBalance());
        dispatch(resetUserPoolData());
        navigate('/Login');
      };

    useEffect(() => {
        dispatch(fetchUsername());
    }, [dispatch, newUsername, username]);

    useEffect(() => {
        setLoading(true)
        if (username) {
            dispatch(fetchUserPicks({username, poolName}));
            dispatch(fetchEmail(username));
            dispatch(fetchProfilePic(username));
            dispatch(fetchPastResults(username));
            setLoading(false)
        }
    }, [dispatch, username, email]);

    useEffect(() => {
        if (email && username) {
            dispatch(getAccountBalance({username, email}))
        }
    }, [email, username, isLoggedIn])

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

    const handleDeletePicks = async () => {
        await dispatch(deleteUserPicks({ username, poolName }));
        await setTier1Picks([]);
        await setTier2Picks([]);
        await setTier3Picks([]);
        await setTier4Picks([]);
        await dispatch(resetAllPicks());
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
    
    const handleSubmitUsername = async () => {
        // Trim the new username before dispatching the actions
        const trimmedUsername = newUsername.trim();
        
        try {
          const resultAction = await dispatch(updateUsername({ username, newUsername: trimmedUsername, token }));
          
          if (updateUsername.rejected.match(resultAction)) {
            // The update failed, set the error message
            setError(resultAction.payload || 'Failed to update username. Please try again.');
            return;
          }
      
          // Dispatch other actions if the update was successful
          dispatch(updateUsernameMyPicks({ username, newUsername: trimmedUsername }));
          dispatch(updateUsernamePool({ username, newUsername: trimmedUsername }));
          dispatch(updateUsernamePastResults({ username, newUsername: trimmedUsername }));
          dispatch(updateUsernameChats({ username, newUsername: trimmedUsername }));
          dispatch(changeUsernameAccountBalance({ username, email, newUsername: trimmedUsername }));
          dispatch(resetPoolUsers());
          dispatch(resetActiveUsers());
          handleCloseModal();
          setSnackbarOpen(true);
      
          setTimeout(() => {
            dispatch(setUsername(trimmedUsername));
            setSnackbarOpen(false);
          }, 2000);
        } catch (error) {
          console.error('Error submitting username change:', error);
        }
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

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleTabChange = (value) => {
        setTabValue(value);
    };

    const handleOpenBalanceModal = () => {
        setBalanceModalOpen(true);
    };

    const handleCloseBalanceModal = async () => {
        setBalanceModalOpen(false);
        dispatch(getAccountBalance({username, email}));
    };

    const handleOpenDeleteModal = () => {
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                '@media (max-width: 600px)': {
                    flexWrap: 'wrap',
                    flexDirection: 'column',
                    marginTop: '1rem',
                },  
            }}>
            <Box
                component="button"
                onClick={handleOpenBalanceModal}
                sx={{
                    backgroundColor: 'lightgray',
                    border: '1px solid black',
                    borderRadius: '4px',
                    position: 'absolute',
                    padding: '5px 10px',
                    width: 120,
                    height: 30,
                    left: 0,
                    top: 120,
                    cursor: 'pointer',
                    display: 'flex',
                    textAlign: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    ':hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    ':focus': {
                        outline: 'none',
                    },
                    '@media (max-width: 600px)': {
                        marginTop: '1rem',
                    },
                }}
            >
                Balance: ${balance?.balance}
            </Box>
            <Modal
                open={isBalanceModalOpen}
                onClose={handleCloseBalanceModal}
                aria-labelledby="account-balance-modal"
                aria-describedby="account-balance-modal-description"
                disableScrollLock
                sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}
            >
                <Box 
                    sx={{ 
                        bgcolor: 'background.paper', 
                        border: '2px solid #000',
                        justifyContent: 'center', 
                        boxShadow: 24, 
                        p: 4 
                    }}
                >
                    <AccountBalance email={email} username={username} onClose={handleCloseBalanceModal}/>
                </Box>
            </Modal>
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
                    <Paper elevation={3} 
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '260px',
                            backgroundColor: "#DEB887",
                            marginTop: '3rem',
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
                        <Button
                            sx={{
                                color: 'red'
                            }}
                            onClick={handleOpenDeleteModal}
                        >
                            Delete Account
                        </Button>
                        <ChangeInfoModal
                            open={openModal}
                            onClose={handleCloseModal}
                            newUsername={newUsername}
                            handleChangeUsername={handleChangeUsername}
                            handleSubmitUsername={handleSubmitUsername}
                            error={error}
                            setError={setError}
                        />
                    </Paper>
                )}
            </Box>
            {/* Main Content */}
            <Box sx={{ 
                    width: '60%',
                    mt: "2rem",
                    '@media (max-width: 600px)': {
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
                                backgroundColor: 'lightgreen',
                                height: '6px',
                            }
                        }}
                        sx={{
                            marginLeft: '16rem',
                            height: '.75rem',
                            '@media (min-width: 600px) and (max-width: 1400px)': {
                                marginLeft: '10rem',
                                },
                            '@media (max-width: 600px)': {
                                    marginLeft: '2.5rem',
                                },
                        }}
                    >
                    {poolName ?
                        <Button 
                            variant="contained"
                            onClick={() => handleTabChange(0)}
                            sx={{
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                },
                                '@media (max-width: 600px)': {
                                        width: '6.5rem',
                                        height: '2rem',
                                        marginTop: '20px',
                                    
                                },
                                '@media (max-width: 1400px)': {
                                        width: '8.5rem',
                                        height: '3rem',
                                },
                            }}
                        >
                            <Tab label="Current Picks"
                                sx={{
                                    '@media (max-width: 600px)': {
                                        fontSize: '11px',
                                        mb: '1rem',
                                    },
                                }}
                            />
                        </Button> :
                        null}
                        <Button 
                            variant="contained"
                            sx={{
                                marginLeft: '1rem',
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                },
                                '@media (max-width: 600px)': {
                                        width: '6.5rem',
                                        height: '2rem',
                                        marginTop: '20px',
                                },
                                '@media (max-width: 1400px)': {
                                        width: '8.5rem',
                                        height: '3rem',
                                },
                            }}
                            onClick={() => handleTabChange(1)}
                        >
                            <Tab label="Past Results"
                                sx={{
                                    '@media (max-width: 600px)': {
                                        fontSize: '11px',
                                        mb: '1rem',
                                    }
                                }}
                            />
                        </Button>
                    </Tabs>
                    {tabValue === 0 && (
                    <CurrentPicks
                        tier1Picks={tier1Picks}
                        tier2Picks={tier2Picks}
                        tier3Picks={tier3Picks}
                        tier4Picks={tier4Picks}
                        allPicks={allUserPicks}
                        format={format}
                    />
                    )}
                    {tabValue === 1 && (
                        <PastResults username={username}/>
                    )}
                </Box>
            </Box>
            {poolName ?
                <Box 
                    sx={{
                        display: 'flex', 
                        justifyContent: 'center',
                        '@media (max-width: 600px)': {
                            width: '100%',
                        }
                        }}>
                    <MyPool info={info}/>
                </Box> :
            null}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: '100%' }}>
                    Username changed successfully
                </Alert>
            </Snackbar>
            <DeleteUser
                username={username}
                visible={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onSuccess={logout}  // After deletion, log the user out
                balance={userBalance}  // Pass the user balance to the modal
                email={email}
            />
        </Box>
    );
}

export default Profile;
