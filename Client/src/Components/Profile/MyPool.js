import React, { useState, } from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { selectUsername } from '../../Features/userSlice';
import { useSelector, } from 'react-redux';
import ChangeSettingsModal from './ChangeSettingsModal';

function MyPool({ info }) {
    const [openModal, setOpenModal] = useState(false);
    const username = useSelector(selectUsername);
    const tournaments = info?.tournaments ?? null;
    const week1DateISO = tournaments?.[0]?.Starts ?? null;
    const week2DateISO = tournaments?.[1]?.Starts ?? null;
    const week3DateISO = tournaments?.[2]?.Starts ?? null;
    const numTournaments = info?.numTournaments ?? null
    const format = info.format;

    const formatDate = (isoDate, addDays = 0) => {
        if (!isoDate) return null;
    
        const date = new Date(isoDate);
        date.setDate(date.getDate() + addDays);
    
        const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    let finalDay;
    if (numTournaments === 2) {
        finalDay = formatDate(week2DateISO, 3);
    } else if (numTournaments === 3) {
        finalDay = formatDate(week3DateISO, 3);
    }
    const currentDate = new Date();
    const currentDay = currentDate.getDay();

    const week1Start = formatDate(week1DateISO);
    const week1StartDate = new Date(week1Start);
    const finalDayDate = new Date(finalDay);
    const currentDayDate = new Date(currentDate);
    
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

    let isButtonDisabled;
    if (format === "Salary Cap" || format === "Single Week") {
        isButtonDisabled = currentDay >= 5 || currentDay === 0;
    } else {
        isButtonDisabled = (currentDayDate > week1StartDate && currentDayDate <= finalDayDate); 
    }

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
                    height: '470px',
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
                }}>
                <Paper sx={{ padding: '.5rem', backgroundColor: 'lightgray' }}>
                    <Typography 
                        variant="h7" 
                        sx={{ fontFamily: 'Rock Salt' }}
                    >
                        Pool Info & Settings
                    </Typography>
                </Paper>
                <Paper sx={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'lightgray' }}>
                    <Typography><b>Name: </b><br/>{info.poolName}</Typography>
                    <br />
                    <Typography><b>Format: </b><br/>{info.format}</Typography>
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
                {isAdmin && (
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
                {isButtonDisabled && isAdmin && (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', fontSize: '11px', mt: '.5rem' }}>
                        {format === "Salary Cap" || format === "Single Week" ?
                            "Settings can't be changed from Thursday through Sunday." :
                            "Settings can't be changed after the start of the first tournament."
                        }
                    </Typography>
                )}
            </Paper>
            <ChangeSettingsModal open={openModal} handleClose={handleCloseModal} />
        </>
    )
};

export default MyPool;
