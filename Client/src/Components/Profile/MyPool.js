import React, { useState, } from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { selectUserPoolData, } from '../../Features/poolsSlice';
import { selectUsername } from '../../Features/userSlice';
import { useSelector, } from 'react-redux';
import ChangeSettingsModal from './ChangeSettingsModal';

function MyPool() {
    const info = useSelector(selectUserPoolData);
    const [openModal, setOpenModal] = useState(false);
    const username = useSelector(selectUsername);

    const isAdmin = info.admin === username

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const firstPlace = info.payouts?.[0]?.first * 100 || 0;
    const secondPlace = info.payouts?.[0]?.second * 100 || 0;
    const thirdPlace = info.payouts?.[0]?.third * 100 || 0;

    const currentDay = new Date().getDay();
    const isButtonDisabled = currentDay >= 5 || currentDay === 0;

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '420px',
                    width: '240px',
                    backgroundColor: "#DEB887",
                    marginTop: '2rem',
                    '@media (min-width: 600px)': {
                        position: 'sticky',
                        top: '20px',
                        zIndex: 1,
                    },
                    '@media (max-width: 600px)': {
                        width: '70%',
                        marginBottom: '2.5rem',
                    },
                }}
            >
                <Paper sx={{ padding: '.5rem' }}>
                    <Typography variant="h7" sx={{ fontFamily: 'Rock Salt' }}>Pool Info & Settings</Typography>
                </Paper>
                <Paper sx={{ marginTop: '1rem', padding: '1rem' }}>
                    <Typography><b>Name: </b>{info.poolName}</Typography>
                    <br />
                    <Typography><b>Admin: </b>{info.admin}</Typography>
                    <br />
                    <Typography>
                        <b>Max Users: </b>{info.maxUsers === null ? "No Max" : info.maxUsers}
                    </Typography>
                    <br />
                    <Typography>
                        <b>Payout Structure:</b>
                        <Typography>1st: {firstPlace}%</Typography>
                        <Typography>2nd: {secondPlace}%</Typography>
                        <Typography>3rd: {thirdPlace}%</Typography>
                    </Typography>
                </Paper>
                {isAdmin && ( // Render the button only if the user is the admin
                    <Button
                        variant="contained"
                        disabled={isButtonDisabled}
                        sx={{
                            marginTop: '1rem',
                            backgroundColor: '#222',
                            '&:hover': {
                                backgroundColor: 'DarkGreen',
                            }
                        }}
                        onClick={handleOpenModal}
                    >
                        Change Settings
                    </Button>
                )}
                {isButtonDisabled && ( // Render a message if the button is disabled
                    <Typography variant="body2" color="textSecondary" sx={{textAlign: 'center', fontSize: '11px', mt: '.5rem'}}>
                        Settings can't be changed from Thursday through Sunday.
                    </Typography>
                )}
            </Paper>
            <ChangeSettingsModal open={openModal} handleClose={handleCloseModal} />
        </>
    )
};

export default MyPool;
