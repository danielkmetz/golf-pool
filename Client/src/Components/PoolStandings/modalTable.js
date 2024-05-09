import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getRoundScore, getScore } from '../../actions';

function ModalTable({ tier1, tier2, tier3, tier4, liveResults, coursePar }) {
    
    const getPos = (name) => {
        const golfer = liveResults.find(golfer => golfer.player_name === name);
    
        if (golfer) {
            return golfer.current_pos;
        } else {
            return;
        }
    };

    const allGolfers = [
        ...tier1.map(name => ({ name, tier: 1 })),
        ...tier2.map(name => ({ name, tier: 2 })),
        ...tier3.map(name => ({ name, tier: 3 })),
        ...tier4.map(name => ({ name, tier: 4 })),
    ].map(golfer => ({ ...golfer, score: getScore(
        golfer.name, liveResults) === "E" ? 0 : parseInt(getScore(golfer.name, liveResults))}))
        .sort((a, b) => a.score - b.score);
    
    const isSmallScreen = window.innerWidth <= 600;

    return (
        <TableContainer component={Paper} sx={{backgroundColor: '#f0f0f0'}}>
            <Table>
                <TableHead>
                    <TableRow  sx={{ '& > *': { fontSize: 12, lineHeight: '5px' }}}>
                        <TableCell><b>Tier</b></TableCell>
                        <TableCell><b>Golfers</b></TableCell>
                        <TableCell><b>Pos</b></TableCell>
                        {!isSmallScreen && (
                            <>
                                <TableCell><b>R1</b></TableCell>
                                <TableCell><b>R2</b></TableCell>
                                <TableCell><b>R3</b></TableCell>
                                <TableCell><b>R4</b></TableCell>
                                <TableCell><b>Total</b></TableCell>
                            </>
                        )}
                        <TableCell><b>Score</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {allGolfers.map((golfer, index) => {
                        return (
                        <TableRow key={index} sx={{ '& > *': { fontSize: 12, lineHeight: '5px' }}}>
                            <TableCell><b>{golfer.tier}</b></TableCell>
                            <TableCell>{golfer.name}</TableCell>
                            <TableCell>{getPos(golfer.name)}</TableCell>
                            {!isSmallScreen && (
                                <>
                                    <TableCell>{getRoundScore(1, golfer.name, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(2, golfer.name, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(3, golfer.name, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(4, golfer.name, liveResults, coursePar)}</TableCell>
                                    <TableCell>
                                        {getRoundScore(1, golfer.name, liveResults) +
                                            getRoundScore(2, golfer.name, liveResults) +
                                            getRoundScore(3, golfer.name, liveResults, coursePar) +
                                            getRoundScore(4, golfer.name, liveResults, coursePar)}
                                    </TableCell>  
                                </>
                            )}
                            <TableCell>{getScore(golfer.name, liveResults)}</TableCell>
                        </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ModalTable;

