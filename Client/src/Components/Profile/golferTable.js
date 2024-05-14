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
    const thresholdDate = new Date('2024-05-16'); // Assuming Thursday is May 16, 2024

    const shouldBlur = currentDate < thresholdDate;
    
    const getGolferThru = (name) => {
        const currentPos = getCurrentPosition(name, liveResults);

        if (currentPos === "--") {
            return; 
        } else {
        const golfer = liveResults.find((g) => g.player_name === name);
        if (golfer) {
            return golfer.thru;
            } else {
                return;
            }
        }
    }
    
    const coursePar = tournamentInfo.Par;
    
    //console.log(leaderboardResults)
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
                        const position = getCurrentPosition(name, liveResults);
                        const round1 = getRoundScore(1, name, liveResults);
                        const round2 = getRoundScore(2, name, liveResults);
                        const round3 = getRoundScore(3, name, liveResults, coursePar);
                        const round4 = getRoundScore(4, name, liveResults, coursePar);
                        const totalScore = round1 + round2 + round3 + round4;

                        return (
                            <TableRow key={index}>
                                <TableCell sx={{ fontSize: '11px' }}>{name}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{shouldBlur ? '---' : position}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{shouldBlur ? '---' : round1}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{shouldBlur ? '---' : round2}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{shouldBlur ? '---' : round3}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{shouldBlur ? '---' : round4}</TableCell>
                                <TableCell sx={{ fontSize: '11px', paddingLeft: '1px' }}>{shouldBlur ? '---' : totalScore}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GolferTable;


