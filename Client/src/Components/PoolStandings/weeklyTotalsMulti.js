import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar } from '@mui/material';
import { selectTotals, fetchUserTotalsForTournaments } from '../../Features/pastResultsSlice';
import { useDispatch, useSelector } from 'react-redux';

const WeeklyTotalsMulti = ({ tournaments, usernames, profilePics }) => {
    const dispatch = useDispatch();
    const totalsData = useSelector(selectTotals);

    useEffect(() => {
        dispatch(fetchUserTotalsForTournaments({ tournaments, usernames }));
    }, [dispatch, tournaments, usernames]);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead
                    sx={{
                        backgroundColor: "blanchedalmond", 
                        position: "sticky", 
                        zIndex: 3, 
                        top: "0px",
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}>
                    <TableRow>
                        <TableCell><b>User</b></TableCell>
                        {tournaments.map((tournament, index) => (
                            <TableCell key={index}><b>Week {index + 1}</b></TableCell>
                        ))}
                        <TableCell><b>Total</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {totalsData && totalsData.map((user, index) => (
                        <TableRow key={index}>
                            <TableCell component="th" scope="row" 
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                {user.username}
                                <Avatar src={`${profilePics[user.username]}`} sx={{ marginLeft: '.5rem' }}/>
                            </TableCell>
                            {tournaments.map((_, idx) => (
                                <TableCell key={idx}>
                                    {user.tournaments[idx] ? user.tournaments[idx].total : '-'}
                                </TableCell>
                            ))}
                            <TableCell>{user.totalScore}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default WeeklyTotalsMulti;
