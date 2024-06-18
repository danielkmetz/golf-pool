import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Modal, Box, Select, MenuItem, Card } from '@mui/material';
import { selectUsername, resetActiveUsers } from '../../Features/userSlice';
import { removeUserFromPool, resetPoolUsers, selectPoolName, resetPoolName, fetchPoolAdmin, updateAdmin, selectPoolAdmin, selectPoolUsers, deletePool } from '../../Features/poolsSlice'; // Updated import statements
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

function PoolInfo() {
    const dispatch = useDispatch();
    const poolName = useSelector(selectPoolName);
    const username = useSelector(selectUsername);
    const admin = useSelector(selectPoolAdmin);
    const poolUsers = useSelector(selectPoolUsers);
    const [open, setOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState('');
    const [openAdminModal, setOpenAdminModal] = useState(false);
    const navigate = useNavigate();

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
                // If the user is the admin and the only user in the pool, delete the pool
                await dispatch(deletePool({poolName, username}));
                await dispatch(resetPoolName());
                await dispatch(resetPoolUsers());
                await dispatch(resetActiveUsers());
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
        <Container sx={{ 
            marginBottom: '2rem', 
            paddingBottom: '.5rem', 
            borderBottom: '1px solid black', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
        }}>
            <Card sx={{
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
            }}>
                <Typography variant="caption" 
                    sx={{ 
                        flexGrow: 1,
                        margin: '20px', 
                    }}
                >
                    <span style={{ fontFamily: 'Rock Salt' }}>Pool Name:</span> <b>{poolName}</b>
                </Typography>
            </Card>
            <Button variant="contained" 
                sx={{ backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }} 
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
