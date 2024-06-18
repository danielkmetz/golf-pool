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

function BettingOdds({ oddsResults, addGolfer }) {
    
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontSize: '18px'}}><b>Name</b></TableCell>
                        <TableCell sx={{fontSize: '18px'}}><b>Odds</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ marginTop: '1rem' }}>
                    {oddsResults.map((result) => (
                        <TableRow >
                            <TableCell>{result.player_name}</TableCell>
                            <TableCell>{(result.draftkings * 100).toFixed(6)}%</TableCell>
                            <Button
                                variant="contained"
                                onClick={() => addGolfer(result.player_name)}
                                sx={{
                                    backgroundColor: '#222',
                                    '&:hover': {
                                        backgroundColor: 'DarkGreen',
                                    }
                                }}
                            >
                                +
                            </Button>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default BettingOdds;
