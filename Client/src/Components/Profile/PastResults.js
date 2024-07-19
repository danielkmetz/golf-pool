import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPastResults, selectPastResults, resetPastResults } from '../../Features/pastResultsSlice';

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Format date without timestamp
}

function getColoredDot(position) {
    switch (position) {
        case "1":
            return <Box component="span" sx={{ ml: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFD700', display: 'inline-block' }} />;
        case "2":
            return <Box component="span" sx={{ ml: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#C0C0C0', display: 'inline-block' }} />;
        case "3":
            return <Box component="span" sx={{ ml: 1, width: 10, height: 10, borderRadius: '50%', backgroundColor: '#CD7F32', display: 'inline-block' }} />;
        default:
            return null;
    }
}

function PastResults({ username }) {
    const dispatch = useDispatch();
    const pastResults = useSelector(selectPastResults);
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);

    console.log(pastResults)

    useEffect(() => {
        setLoading(true);
        setShowContent(false);

        const fetchResults = async () => {
            await dispatch(fetchPastResults(username));
            setLoading(false);
            setShowContent(true);
        };

        fetchResults();
    }, [dispatch]);

    const sortedResults = pastResults.results ? [...pastResults.results].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

    return (
        <Container
            sx={{
                maxHeight: '500px',
                overflowY: 'scroll',
                width: '70%',
                opacity: showContent ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                '@media (max-width: 600px)': {
                    width: '100%',
                    mb: '2rem',
                }
            }}
        >
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : sortedResults.length > 0 ? (
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
                        <TableBody>
                            {sortedResults.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell>{formatDate(result.date)}</TableCell>
                                    <TableCell>{result.tournamentName}</TableCell>
                                    <TableCell>
                                        {result.position}
                                        {getColoredDot(result.position)}
                                    </TableCell>
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
