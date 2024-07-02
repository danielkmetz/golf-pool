import React, { useEffect } from 'react';
import { Container, Typography, Table, TableBody, Box, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPastResults, selectPastResults } from '../../Features/pastResultsSlice';

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format date without timestamp
}

function PastResults({ username }) {
    const dispatch = useDispatch();
    const pastResults = useSelector(selectPastResults);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                if (username) {
                    await dispatch(fetchPastResults(username));
                }
            } catch (error) {
                console.error("Error fetching past results:", error);
            }
        };

        fetchResults();
    }, [dispatch, username]);

    return (
        <Container 
            sx={{
                width: '70%',
                '@media (max-width: 600px)': {
                    width: '100%',
                }
            }}>
            {pastResults.results && pastResults.results.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead 
                            sx={{
                                backgroundColor: 'green',
                                borderBottom: '2px solid black',  // Add solid bottom border
                            }}>
                            <TableRow>
                                <TableCell 
                                    sx={{
                                        fontSize: '20px',
                                        '@media (max-width: 600px)': {
                                            fontSize: '15px',
                                            }
                                        }}>
                                        <b>Date</b>
                                </TableCell>
                                <TableCell 
                                    sx={{
                                        fontSize: '20px',
                                        '@media (max-width: 600px)': {
                                            fontSize: '15px',
                                            }
                                        }}>
                                            <b>Tournament</b>
                                </TableCell>
                                <TableCell 
                                    sx={{
                                        fontSize: '20px',
                                        '@media (max-width: 600px)': {
                                            fontSize: '15px',
                                            }
                                        }}>
                                            <b>Position</b>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody
                            sx={{
                                maxHeight: '650px',
                                overflowY: 'scroll',
                            }}>
                            {pastResults.results.map((result, index) => (
                                <TableRow 
                                    key={index} 
                                    sx={{ 
                                        backgroundColor: 
                                            result.position === 1 ? '#FFD700' : 
                                            result.position === 2 ? '#C0C0C0' : 
                                            result.position === 3 ? '#CD7F32' : 
                                            'transparent',
                                    }}>
                                    <TableCell>{formatDate(result.date)}</TableCell>
                                    <TableCell>{result.tournamentName}</TableCell>
                                    <TableCell>{result.position}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="h6" color="textSecondary" align="center" sx={{ mt: 4 }}>
                    No past results available.
                </Typography>
            )}
        </Container>
    );
}

export default PastResults;
