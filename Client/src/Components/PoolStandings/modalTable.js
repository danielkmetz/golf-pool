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
    
    const isSmallScreen = window.innerWidth <= 600;

    return (
        <TableContainer component={Paper}>
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
                    {tier1.map((golfer, index) => {
                        return (
                        <TableRow key={index} sx={{ '& > *': { fontSize: 12, lineHeight: '5px' }}}>
                            <TableCell><b>1</b></TableCell>
                            <TableCell>{golfer}</TableCell>
                            <TableCell>{getPos(golfer)}</TableCell>
                            {!isSmallScreen && (
                                <>
                                    <TableCell>{getRoundScore(1, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(2, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(3, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(4, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>
                                        {getRoundScore(1, golfer, liveResults) +
                                            getRoundScore(2, golfer, liveResults) +
                                            getRoundScore(3, golfer, liveResults, coursePar) +
                                            getRoundScore(4, golfer, liveResults, coursePar)}
                                    </TableCell>  
                                </>
                            )}
                            <TableCell>{getScore(golfer, liveResults)}</TableCell>
                        </TableRow>
                        )
                    })}
                    {tier2.map((golfer, index) => {
                        return (
                        <TableRow key={index} sx={{ '& > *': { fontSize: 12, lineHeight: '5px' }}}>
                            <TableCell><b>2</b></TableCell>
                            <TableCell>{golfer}</TableCell>
                            <TableCell>{getPos(golfer)}</TableCell>
                            {!isSmallScreen && (
                                <>
                                    <TableCell>{getRoundScore(1, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(2, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(3, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(4, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>
                                        {getRoundScore(1, golfer, liveResults) +
                                            getRoundScore(2, golfer, liveResults) +
                                            getRoundScore(3, golfer, liveResults, coursePar) +
                                            getRoundScore(4, golfer, liveResults, coursePar)}
                                    </TableCell>  
                                </>
                            )}
                            <TableCell>{getScore(golfer, liveResults)}</TableCell>
                        </TableRow>
                        )
                    })}
                    {tier3.map((golfer, index) => {
                        return (
                        <TableRow key={index} sx={{ '& > *': { fontSize: 12, lineHeight: '5px' }}}>
                            <TableCell><b>3</b></TableCell>
                            <TableCell>{golfer}</TableCell>
                            <TableCell>{getPos(golfer)}</TableCell>
                            {!isSmallScreen && (
                                <>
                                    <TableCell>{getRoundScore(1, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(2, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(3, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(4, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>
                                        {getRoundScore(1, golfer, liveResults) +
                                            getRoundScore(2, golfer, liveResults) +
                                            getRoundScore(3, golfer, liveResults, coursePar) +
                                            getRoundScore(4, golfer, liveResults, coursePar)}
                                    </TableCell>  
                                </>
                            )}
                            <TableCell>{getScore(golfer, liveResults)}</TableCell>
                        </TableRow>
                        )
                    })}
                    {tier4.map((golfer, index) => {
                        return (
                        <TableRow key={index} sx={{ '& > *': { fontSize: 12, lineHeight: '5px' }}}>
                            <TableCell><b>4</b></TableCell>
                            <TableCell>{golfer}</TableCell>
                            <TableCell>{getPos(golfer)}</TableCell>
                            {!isSmallScreen && (
                                <>
                                    <TableCell>{getRoundScore(1, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(2, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(3, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>{getRoundScore(4, golfer, liveResults, coursePar)}</TableCell>
                                    <TableCell>
                                        {getRoundScore(1, golfer, liveResults) +
                                            getRoundScore(2, golfer, liveResults) +
                                            getRoundScore(3, golfer, liveResults, coursePar) +
                                            getRoundScore(4, golfer, liveResults, coursePar)}
                                    </TableCell>  
                                </>
                            )}
                            <TableCell>{getScore(golfer, liveResults)}</TableCell>
                        </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ModalTable;

