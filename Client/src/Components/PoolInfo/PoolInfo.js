import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Modal, Box, Select, MenuItem, Card } from '@mui/material';
import { selectUsername, resetActiveUsers } from '../../Features/userSlice';
import { 
    removeUserFromPool, 
    resetPoolUsers, 
    selectUserPoolData, 
    resetPoolName, 
    fetchPoolAdmin, 
    updateAdmin, 
    selectPoolAdmin, 
    selectPoolUsers, 
    deletePool, 
    resetUserPoolData 
} from '../../Features/poolsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

function PoolInfo() {
    const dispatch = useDispatch();
    const info = useSelector(selectUserPoolData);
    const username = useSelector(selectUsername);
    const admin = useSelector(selectPoolAdmin);
    const poolUsers = useSelector(selectPoolUsers);
    const [open, setOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState('');
    const [openAdminModal, setOpenAdminModal] = useState(false);
    const navigate = useNavigate();
    const poolName = info.poolName;
    const format = info.format;

    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const isButtonDisabled = currentDay >= 4 || currentDay === 0;

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (poolName) {
            dispatch(fetchPoolAdmin(poolName));
        }
    }, [dispatch, poolName]);

    const isAdmin = (username, admin) => {
        return username === admin;
    };

    const handleConfirm = async () => {
        if (isAdmin(username, admin)) {
            if (poolUsers.length === 1) {
                await dispatch(deletePool({ poolName, username }));
                await dispatch(resetPoolName());
                await dispatch(resetPoolUsers());
                await dispatch(resetActiveUsers());
                await dispatch(resetUserPoolData());
                navigate('/Join-Pool');
            } else {
                setOpenAdminModal(true);
            }
        } else {
            await dispatch(removeUserFromPool({ poolName, username }));
            await dispatch(resetPoolName());
            await dispatch(resetPoolUsers());
            await dispatch(resetActiveUsers());
            navigate('/Join-Pool');
            handleClose();
        }
    };

    const handleAdminConfirm = async () => {
        await dispatch(updateAdmin({ poolName, newAdmin }));
        await dispatch(removeUserFromPool({ poolName, username }));
        await dispatch(resetPoolName());
        await dispatch(resetPoolUsers());
        await dispatch(resetActiveUsers());
        setOpenAdminModal(false);
        navigate('/Join-Pool');
    };

    return (
        <Container 
            sx={{ 
                marginBottom: '2rem', 
                paddingBottom: '.5rem', 
                borderBottom: '1px solid black', 
                display: 'flex', 
                flexDirection: 'row',
                alignItems: 'center',
                '@media (max-width: 1400px)': {    
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    alignItems: 'center',
                }, 
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Card 
                    sx={{
                        height: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '13rem',
                        '@media (max-width: 600px)': {
                            ml: '-1rem',
                        },
                    }}
                >
                    <Typography variant="caption" 
                        sx={{ 
                            flexGrow: 1,
                            margin: '5px',
                            '@media (min-width: 600px) and (max-width: 1200px)': {
                                fontSize: '11px',   
                            },
                        }}
                    >
                        <span style={{ fontFamily: 'Rock Salt' }}>Pool Name:</span> <b>{poolName}</b>
                    </Typography>
                </Card>
                <Card 
                    sx={{
                        height: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        width: '10rem',
                        '@media (max-width: 600px)': {
                            mr: '-1rem',
                        },
                        '@media (min-width: 1400px)': {
                            mr: '2rem',
                        },    
                    }}
                >
                    <Typography variant="caption" 
                        sx={{ 
                            flexGrow: 1,
                            margin: '5px',
                            '@media (min-width: 600px) and (max-width: 1200px)': {
                                fontSize: '11px',
                            },
                        }}                  
                    >
                        <span style={{ fontFamily: 'Rock Salt' }}>Format:</span> <b>{format}</b>
                    </Typography>
                </Card>
            </Box>
            <Button variant="contained" 
                sx={{ 
                    backgroundColor: 'red',
                    height: 'auto',
                    '@media (min-width: 1400px)': {
                        whiteSpace: 'nowrap',
                    },
                    '@media (max-width: 1400px)': {
                        width: 'auto',
                        fontSize: '11px',
                        mt: .5,
                    },
                    '&:hover': { 
                        backgroundColor: 'darkred' 
                    } 
                }} 
                onClick={handleOpen}
                disabled={isButtonDisabled}
            >
                Leave Pool
            </Button>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 300, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                }}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Are you sure you want to leave this pool?
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleClose}
                            sx={{
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" 
                            sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
                            onClick={handleConfirm}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <Modal open={openAdminModal} onClose={() => setOpenAdminModal(false)} aria-labelledby="admin-modal-title" aria-describedby="admin-modal-description">
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: 300, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                }}>
                    <Typography id="admin-modal-title" variant="h6" component="h2">
                        Please choose a new admin before leaving the pool.
                    </Typography>
                    <Select
                        value={newAdmin}
                        onChange={(e) => setNewAdmin(e.target.value)}
                        displayEmpty
                        sx={{ width: '100%', mt: 2 }}
                    >
                        <MenuItem value="" disabled>Select a user</MenuItem>
                        {poolUsers.filter(user => user.username !== username).map(user => (
                            <MenuItem key={user.username} value={user.username}>{user.username}</MenuItem>
                        ))}
                    </Select>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => setOpenAdminModal(false)}
                            sx={{
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button variant="contained" 
                            sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }}
                            onClick={handleAdminConfirm}
                        >
                            Confirm
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Container>
    );
}

export default PoolInfo;
