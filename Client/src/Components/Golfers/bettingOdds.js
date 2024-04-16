import React from 'react';
import {
    TableContainer,
    TableBody,
    TableRow,
    TableCell,
    Table,
    Button,
} from '@mui/material';

function BettingOdds({ oddsResults, addGolfer }) {
    
    return (
        <TableContainer>
            <Table>
                <TableBody sx={{ marginTop: '1rem' }}>
                    {oddsResults.map((result) => (
                        <TableRow key={result.dg_id}>
                            <TableCell>{result.player_name}</TableCell>
                            <TableCell>{(result.draftkings * 100).toFixed(2)}%</TableCell>
                            <Button
                                variant="contained"
                                onClick={() => addGolfer(result.player_name)}
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
