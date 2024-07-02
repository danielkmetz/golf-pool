import React, { useEffect } from 'react';
import { 
    Typography, 
    Table, 
    TableContainer, 
    TableHead, 
    TableRow, 
    TableCell, 
    TableBody,
    Paper,
} from '@mui/material';
import { 
    fetchLeaderboard,
    selectResults, 
} from '../../Features/LeaderboardSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from '@mui/material';
import Positions from './Positions';
import Rounds from './Rounds';

function Leaderboard() {
    const dispatch = useDispatch();
    const results = useSelector(selectResults);
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const isMobile = useMediaQuery('(max-width:600px)'); // Adjust the max-width as needed

    useEffect(() => {
        dispatch(fetchLeaderboard());
    }, [dispatch]);

    const parseTeeTime = (teeTimeStr) => {
        try {
            const [time, period] = teeTimeStr.split(' ');
            const [hours, minutes] = time.split(':');
            let hours24 = parseInt(hours, 10);
            if (period === 'PM' && hours24 !== 12) {
                hours24 += 12;
            } else if (period === 'AM' && hours24 === 12) {
                hours24 = 0;
            }
            return new Date(2000, 0, 1, hours24, parseInt(minutes, 10));
        } catch (error) {
            return null; // or any default value indicating an error
        }
    };

    const sortedResults = results.slice().sort((a, b) => {
        try {
            const timeA = parseTeeTime(a.r1_teetime);
            const timeB = parseTeeTime(b.r1_teetime);
            if (!timeA || !timeB) {
                return 0; // or handle the case where parsing failed
            }
            return timeA - timeB;
        } catch (error) {
            return 0; // or handle the sorting error
        }
    });

    const fontSize = isMobile ? '10px' : '12px';

    return (
        <>
            <Paper 
                sx={{ 
                    padding: '.5rem', 
                    marginBottom: '1rem', 
                    borderRadius: '8px', 
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: 'LightGray'
                }}>
                <Typography
                    variant="h6"
                    sx={{
                        marginTop: '.5rem',
                        marginBottom: '.5rem',
                        backgroundColor: '#222',
                        color: '#FFF',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 'bold',
                        fontSize: '2.5rem',
                        textAlign: 'center',
                        paddingLeft: '1.5rem',
                        paddingRight: '1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                        width: '30rem',
                    }}
                >
                    LEADERBOARD
                </Typography>
            </Paper>
            <TableContainer sx={{ maxHeight: "550px" }}>
                <Table>
                    <TableHead 
                    sx={{
                        backgroundColor: "blanchedalmond", 
                        position: "sticky", 
                        zIndex: 3, 
                        top: "0px",
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}>
                        {currentDay >= 4 || currentDay === 0 ? (
                            <TableRow>
                                <TableCell sx={{ fontSize }}><b>Player Name</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>Pos</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>Score</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>Thru</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>Today</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>R1</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>R2</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>R3</b></TableCell>
                                <TableCell sx={{ fontSize, paddingLeft: '.5px' }}><b>R4</b></TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell sx={{ fontSize }}><b>Player Name</b></TableCell>
                                <TableCell sx={{ fontSize }}><b>Tee Time</b></TableCell>
                            </TableRow>
                        )}
                    </TableHead>
                    <TableBody sx={{ overflow: "scroll" }}>
                        {currentDay >= 4 || currentDay === 0 ? <Rounds /> : <Positions results={sortedResults} />}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default Leaderboard;
