import React from 'react';
import {
    TableContainer,
    TableBody,
    TableRow,
    TableCell,
    Table,
    Button,
    TableHead,
} from '@mui/material';

function BettingOdds({ oddsResults, addGolfer, format, tier }) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontSize: '18px' }}><b>Name</b></TableCell>
                        {format === "Salary Cap" || format === "Multi-Week Salary Cap" ? 
                            <TableCell sx={{ fontSize: '18px' }}><b>Cost</b></TableCell> : 
                            <TableCell sx={{ fontSize: '18px' }}><b>Odds</b></TableCell>
                        }
                    </TableRow>
                </TableHead>
                <TableBody sx={{ marginTop: '1rem' }}>
                    {oddsResults.map((result) => (
                        <TableRow key={result.player_name}>
                            <TableCell>{result.player_name}</TableCell>
                            <TableCell>
                                {format === 'Salary Cap' || format === "Multi-Week Salary Cap" ? (
                                    tier === 'Tier1' ? '25 Credits' :
                                    tier === 'Tier2' ? '15 Credits' :
                                    tier === 'Tier3' ? '10 Credits' :
                                    '5 Credits'
                                ) : (
                                    `${(result.draftkings * 100).toFixed(2)}%`
                                )}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    onClick={() => addGolfer(result.player_name)}
                                    sx={{
                                        backgroundColor: '#222',
                                        ml: '-.5rem',
                                        '&:hover': {
                                            backgroundColor: 'DarkGreen',
                                        },
                                        '@media (max-width: 600px)': {
                                            ml: '-1.2rem',
                                        },
                                    }}
                                >
                                    +
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default BettingOdds;
