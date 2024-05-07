import React, {useEffect} from 'react';
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
import { useDispatch, useSelector} from 'react-redux';
import Positions from './Positions';
import Rounds from './Rounds';

function Leaderboard() {
    const dispatch = useDispatch();
    const results = useSelector(selectResults);
    const currentDate = new Date();
    const currentDay = currentDate.getDay();

    console.log(results);
    
    useEffect(() => {
        dispatch(fetchLeaderboard());
    }, [dispatch]);

    return (
        <>
        <Paper sx={{ padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            }}>
            <Typography
                variant="h6"
                sx={{
                marginTop: '1rem',
                backgroundColor: '#009', // Orange background color
                color: '#FFF', // White text color
                fontFamily: 'Roboto, sans-serif', // Use a professional font
                fontWeight: 'bold',
                fontSize: '2.5rem',
                textAlign: 'center',
                padding: '1rem', // Add padding for better spacing
                borderRadius: '8px', // Rounded corners
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Soft shadow for depth
                }}
            >
                LEADERBOARD
            </Typography>
        </Paper>
        <TableContainer sx={{maxHeight: "700px"}}>
            <Table>
                <TableHead sx={{
                    backgroundColor: "blanchedalmond", 
                    position: "sticky", 
                    zIndex: 3, 
                    top: "0px",
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                }}>
                {currentDay >= 4 || currentDay === 0 ? 
                    (
                    <TableRow>
                        <TableCell>Player Name</TableCell>
                        <TableCell>Current Pos</TableCell>
                        <TableCell>Thru</TableCell>
                        <TableCell>Today</TableCell>
                        <TableCell>R1</TableCell>
                        <TableCell>R2</TableCell>
                        <TableCell>R3</TableCell>
                        <TableCell>R4</TableCell>
                        <TableCell>Total</TableCell>
                    </TableRow>
                    ) : (
                    <TableRow>
                        <TableCell>Player Name</TableCell>
                        <TableCell>Tee Time</TableCell>
                    </TableRow>
                    )
                }
                </TableHead>
                <TableBody sx={{overflow: "scroll"}}>
                    {currentDay >= 4 || currentDay === 0 ? <Rounds />  : <Positions results={results}/>}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    )
};

export default Leaderboard;

