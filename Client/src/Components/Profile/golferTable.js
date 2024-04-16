// GolferTable.js
import React from 'react';
import { getRoundScore, getCurrentPosition } from '../../actions';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, TableHead, TableRow, Paper,} from '@mui/material'
    
function GolferTable({tierPicks, liveResults, tournamentInfo}) {
    
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
                        <TableCell><b>Golfer</b></TableCell>
                        <TableCell><b>Tee Time</b></TableCell>
                        <TableCell><b>Position</b></TableCell>
                        <TableCell><b>Thru</b></TableCell>
                        <TableCell><b>R1</b></TableCell>
                        <TableCell><b>R2</b></TableCell>
                        <TableCell><b>R3</b></TableCell>
                        <TableCell><b>R4</b></TableCell>
                        <TableCell><b>Total</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {tierPicks.map((name, index) => {
                        
                        return (
                            <TableRow key={index}>
                                <TableCell>{name}</TableCell>
                                <TableCell>{}</TableCell>
                                <TableCell>{getCurrentPosition(name, liveResults)}</TableCell>
                                <TableCell>{getGolferThru(name)}</TableCell>
                                <TableCell>{getRoundScore(1, name, liveResults)}</TableCell>
                                <TableCell>{getRoundScore(2, name, liveResults)}</TableCell>
                                <TableCell>{getRoundScore(3, name, liveResults, coursePar)}</TableCell>
                                <TableCell>{getRoundScore(4, name, liveResults, coursePar)}</TableCell>
                                <TableCell>{getRoundScore(1, name, liveResults) + 
                                            getRoundScore(2, name, liveResults) + 
                                            getRoundScore(3, name, liveResults, coursePar) +
                                            getRoundScore(4, name, liveResults, coursePar)}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GolferTable;


