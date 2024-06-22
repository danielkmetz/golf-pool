import React, {useState, useEffect} from 'react';
import { Modal, Typography, Box, Button, TextField, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserPoolData, selectPoolUsers, editPoolSettings, setUserPoolData } from '../../Features/poolsSlice';
import { selectUsername } from '../../Features/userSlice';

function ChangeSettingsModal({ open, handleClose }) {
    const info = useSelector(selectUserPoolData);
    const poolUsers = useSelector(selectPoolUsers);
    const username = useSelector(selectUsername);
    const dispatch = useDispatch();
    const oldPoolName = info.poolName;
    const users = info.users;
    
    const firstPlace = info.payouts?.[0]?.first * 100 || 0;
    const secondPlace = info.payouts?.[0]?.second * 100 || 0;
    const thirdPlace = info.payouts?.[0]?.third * 100 || 0;

    const [newPoolName, setNewPoolName] = useState(info.poolName);
    const [newAdmin, setNewAdmin] = useState(info.admin);
    const [newMaxUsers, setNewMaxUsers] = useState(info.maxUsers);
    const [newFirstPayout, setNewFirstPayout] = useState(firstPlace);
    const [newSecondPayout, setNewSecondPayout] = useState(secondPlace);
    const [newThirdPayout, setNewThirdPayout] = useState(thirdPlace);
    const [error, setError] = useState('');
    const newBuyIn = info.buyIn;

    useEffect(() => {
        setNewPoolName(info.poolName);
        setNewAdmin(info.admin);
        setNewMaxUsers(info.maxUsers);
        setNewFirstPayout(firstPlace);
        setNewSecondPayout(secondPlace);
        setNewThirdPayout(thirdPlace);
    }, [info]);

    const handleNewFirstPayoutChange = (value) => {
        setNewFirstPayout(parseFloat(value));
        if (value === 100) {
            setNewFirstPayout(parseFloat(100));
            setNewSecondPayout(parseFloat(0));
            setNewThirdPayout(parseFloat(0));
        } else {
            setNewFirstPayout(parseFloat(value));
        }
    };

    const handleSubmit = () => {
        const totalPayout = newFirstPayout + newSecondPayout + newThirdPayout;
        const epsilon = 0.000001;
        
        if (Math.abs(totalPayout - 100) > epsilon) {
            setError('The total payout percentages must equal 100%.');
            console.log('Error: The total payout percentages must equal 100%.');
            return;
        }
        const maxUsersValue = newMaxUsers === "No Max" ? null : newMaxUsers;
        
        dispatch(editPoolSettings({
            oldPoolName,
            newPoolName,
            newAdmin,
            maxUsersValue,
            newBuyIn,
            newPayouts: {
                first: newFirstPayout / 100,
                second: newSecondPayout / 100,
                third: newThirdPayout / 100,
            },
        }));

        dispatch(setUserPoolData({
            poolName: newPoolName,
            admin: newAdmin,
            maxUsers: maxUsersValue,
            buyIn: newBuyIn,
            payouts: {
                first: newFirstPayout / 100,
                second: newSecondPayout / 100,
                third: newThirdPayout / 100,
            },
            users: users,
        }))
        handleClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box 
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    '@media (max-width: 600px)': {
                            width: '70%',
                        },
                
            }}>
                <Typography variant="h6" id="modal-modal-title" sx={{fontFamily: 'Rock Salt'}}>Change Settings</Typography>
                <FormControl  sx={{marginTop: '1rem'}}>
                    <Typography variant="caption">Pool Name:</Typography>
                    <TextField 
                        placeholder={info.poolName}
                        value={newPoolName}
                        onChange={(e) => {
                            setNewPoolName(e.target.value);
                        }}
                    >
                        {newPoolName}
                    </TextField>
                </FormControl>
                <FormControl  sx={{marginTop: '1rem'}}>
                    <Typography variant="caption">Admin:</Typography>
                    <Select
                        value={newAdmin}
                        onChange={(e) => setNewAdmin(e.target.value)}
                        displayEmpty
                        sx={{ width: '100%'}}
                    >
                        <MenuItem value={newAdmin} disabled>{newAdmin}</MenuItem>
                        {poolUsers.filter(user => user.username !== username).map(user => (
                            <MenuItem key={user.username} value={user.username}>{user.username}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ marginTop: '1rem',}}>
                    <Typography variant="caption">Max Users:</Typography>
                    <Select
                        value={newMaxUsers}
                        onChange={(e) => setNewMaxUsers(e.target.value)}
                        sx={{ width: '100%',}} // Set the width of the Select component to 100% within the FormControl
                    >
                        <MenuItem value="No Max">No Max</MenuItem>
                        {[20, 25, 30, 35, 40, 50].map((num) => (
                            <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ marginTop: '1rem' }}>
                        <Typography><b>Payouts</b></Typography>
                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Choose what percentage of the pot 1st 2nd and 3rd receive</Typography>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <FormControl 
                                sx={{ 
                                    width: '25%', 
                                    marginTop: '.75rem',
                                    '@media (max-width: 600px)': {
                                        width: '21%',
                                        }, 
                                    }}>
                                <InputLabel id="1st-place-payout-label">1st</InputLabel>
                                <Select
                                    labelId='1st-place-payout-label'
                                    value={newFirstPayout}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        handleNewFirstPayoutChange(value);
                                    }}
                                    label='first-place-payout'
                                    sx={{
                                        '@media (max-width: 600px)': {
                                            fontSize: '10px',
                                            },
                                    }}
                                >
                                    <MenuItem value={100}>100%</MenuItem>
                                    <MenuItem value={75}>75%</MenuItem>
                                    <MenuItem value={70}>70%</MenuItem>
                                    <MenuItem value={65}>65%</MenuItem>
                                    <MenuItem value={60}>60%</MenuItem>
                                </Select>
                            </FormControl>
                            {newFirstPayout === 100 ? null :
                                <>
                                    <FormControl 
                                        sx={{ 
                                            width: '25%', 
                                            marginTop: '.75rem', 
                                            marginLeft: '2rem',
                                            '@media (max-width: 600px)': {
                                                width: '21%',
                                                }, 
                                            }}>
                                        <InputLabel id="2nd-place-payout-label">2nd</InputLabel>
                                        <Select
                                            labelId='2nd-place-payout-label'
                                            value={newSecondPayout}
                                            onChange={(e) => setNewSecondPayout(parseFloat(e.target.value))}
                                            label='second-place-payout'
                                            sx={{
                                                '@media (max-width: 600px)': {
                                                    fontSize: '10px',
                                                    },
                                            }}
                                        >
                                            <MenuItem value={30}>30%</MenuItem>
                                            <MenuItem value={25}>25%</MenuItem>
                                            <MenuItem value={20}>20%</MenuItem>
                                            <MenuItem value={15}>15%</MenuItem>
                                            <MenuItem value={10}>10%</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl 
                                        sx={{ 
                                            width: '25%', 
                                            marginTop: '.75rem', 
                                            marginLeft: '2rem',
                                            '@media (max-width: 600px)': {
                                                width: '21%',
                                                }, 
                                            }}>
                                        <InputLabel id="3rd-place-payout-label">3rd</InputLabel>
                                        <Select
                                            labelId='3rd-place-payout-label'
                                            value={newThirdPayout}
                                            onChange={(e) => setNewThirdPayout(parseFloat(e.target.value))}
                                            label='third-place-payout'
                                            sx={{
                                                '@media (max-width: 600px)': {
                                                    fontSize: '10px',
                                                    },
                                            }}
                                        >
                                            <MenuItem value={15}>15%</MenuItem>
                                            <MenuItem value={10}>10%</MenuItem>
                                            <MenuItem value={5}>5%</MenuItem>
                                            <MenuItem value={0}>0%</MenuItem>
                                        </Select>
                                    </FormControl>
                                </>
                            }
                        </Box>
                    </Box>
                {error && (
                    <Typography variant="caption" color="error">
                        {error}
                    </Typography>
                )}
                <Button 
                    variant='contained'
                    onClick={handleSubmit} 
                    sx={{
                        marginTop: '1rem',
                        backgroundColor: '#222',
                        '&:hover': {
                            backgroundColor: 'DarkGreen',
                        }
                    }}
                >
                    Submit
                </Button>
                <Button 
                    onClick={handleClose} 
                    variant="contained" 
                    sx={{
                        marginTop: '1rem',
                        backgroundColor: '#222',
                        '&:hover': {
                            backgroundColor: 'DarkGreen',
                        }
                        }}
                >
                    Close
                </Button>
            </Box>
        </Modal>
    );
}

export default ChangeSettingsModal;
