// GolferTable.js
import React, {useState} from 'react';
import { getRoundScore, getCurrentPosition } from '../../actions';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, TableHead, TableRow, Paper,} from '@mui/material'
    
function GolferTable({tierPicks, liveResults, tournamentInfo}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentDay = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const isValidDay = currentDay >= 4 || currentDay === 0; // Thursday (4) to Sunday (0)
    const coursePar = tournamentInfo.Par;
    
    return (
        <TableContainer component={Paper} variant="outlined" square>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontSize: '10px'}}><b>Golfer</b></TableCell>
                        <TableCell sx={{fontSize: '10px', paddingLeft: '1px'}}><b>Position</b></TableCell>
                        <TableCell sx={{fontSize: '10px',  paddingLeft: '1px'}}><b>R1</b></TableCell>
                        <TableCell sx={{fontSize: '10px',  paddingLeft: '1px'}}><b>R2</b></TableCell>
                        <TableCell sx={{fontSize: '10px',  paddingLeft: '1px'}}><b>R3</b></TableCell>
                        <TableCell sx={{fontSize: '10px',  paddingLeft: '1px'}}><b>R4</b></TableCell>
                        <TableCell sx={{fontSize: '10px',  paddingLeft: '1px'}}><b>Total</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tierPicks.map((name, index) => {
                    if (isValidDay) {
                        const position = getCurrentPosition(name, liveResults, isValidDay);
                        const round1 = getRoundScore(1, name, liveResults,);
                        const round2 = getRoundScore(2, name, liveResults);
                        const round3 = getRoundScore(3, name, liveResults, coursePar);
                        const round4 = getRoundScore(4, name, liveResults, coursePar);
                        const totalScore = round1 + round2 + round3 + round4;

                        return (
                            <TableRow key={index}>
                                <TableCell sx={{ fontSize: '11px' }}>{name}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{position}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{round1}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{round2}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{round3}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{round4}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{totalScore}</TableCell>
                            </TableRow>
                        );
                    } else {
                        return (
                            <TableRow key={index}>
                                <TableCell sx={{ fontSize: '11px' }}>{name}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}></TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}></TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}></TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}></TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}></TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}></TableCell>
                            </TableRow>
                        );
                    }
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GolferTable;


