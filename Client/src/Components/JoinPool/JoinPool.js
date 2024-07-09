import React, { useEffect, useState } from 'react';
import { Container, Box, Card, 
    Typography, TextField, List, ListItem, 
    ListItemText, Button, Select, MenuItem, FormControl, 
    InputLabel, Grid, Accordion, AccordionSummary, 
    AccordionDetails, Modal, Backdrop, Fade } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchPools, selectPools, setPoolName } from '../../Features/poolsSlice';
import { selectUsername } from '../../Features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import axios from 'axios';

function JoinPool() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const pools = useSelector(selectPools);
    const username = useSelector(selectUsername);
    const [searchQuery, setSearchQuery] = useState('');
    const [formatFilter, setFormatFilter] = useState('');
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [enteredPin, setEnteredPin] = useState('');
    const [selectedPool, setSelectedPool] = useState(null);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };    
    
    useEffect(() => {
        dispatch(fetchPools());
    }, [dispatch]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFormatChange = (event) => {
        setFormatFilter(event.target.value);
    };

    const handleJoinPool = async (pool) => {
        if (pool.isPrivate) {
            setSelectedPool(pool); // Set the selected pool for joining
            setPinModalOpen(true); // Open the pin modal
        } else {
            joinPool(pool.poolName);
        }
    };

    const joinPool = async (poolName) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/create-pool/join`, 
                { poolName, username });

            if (response.status === 200) {
                dispatch(setPoolName(poolName));
                alert('Successfully joined the pool!');
                navigate('/Standings');
            }
        } catch (error) {
            console.error('Error joining pool:', error);
            alert('Failed to join the pool.');
        }
    };

    const handlePinInputChange = (event) => {
        setEnteredPin(event.target.value);
    };

    const handlePinSubmit = () => {
        if (enteredPin === selectedPool.password) {
            joinPool(selectedPool.poolName);
            setPinModalOpen(false); // Close the modal after successful join
        } else {
            alert('Incorrect pin. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setPinModalOpen(false);
    };

    const filteredPools = pools.filter(pool =>
        pool.poolName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (formatFilter === '' || pool.format === formatFilter)
    );

    const uniqueFormats = [...new Set(pools.map(pool => pool.format))];

    return (
        <Container sx={{ marginTop: '.5rem' }}>
            <Container sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card
                    sx={{
                        height: '5rem',
                        alignItems: 'center',
                        backgroundColor: 'lightgray',
                        width: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        '@media (max-width: 600px)': {
                            width: '100%',
                        },
                    }}>
                    <Typography variant="h4"
                        sx={{
                            fontFamily: 'Rock Salt',
                            textAlign: 'center',
                            alignItems: 'center',
                            backgroundColor: 'blanchedAlmond',
                            width: '95%',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                            height: '4rem',
                            display: 'flex',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                        }}>
                        Available Pools
                    </Typography>
                </Card>
            </Container>
            <Typography variant="caption" sx={{ marginTop: '.5rem', fontStyle: 'italic', textAlign: 'center', display: 'block' }}>
                Join a random pool or search for one!
            </Typography>
            <Grid container spacing={2} sx={{ marginTop: '.5rem' }}>
                <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        sx={{ width: '80%' }}
                        placeholder="Search Pools"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <FormControl sx={{ marginTop: '1rem', width: '80%' }}>
                        <InputLabel>Filter by Format</InputLabel>
                        <Select
                            value={formatFilter}
                            onChange={handleFormatChange}
                            label="Filter by Format"
                        >
                            <MenuItem value=''><em>All</em></MenuItem>
                            {uniqueFormats.map((format, index) => (
                                <MenuItem key={index} value={format}>{format}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Card
                        sx={{
                            marginTop: '2rem',
                            width: '80%',
                            backgroundColor: 'lightgray',
                            padding: '1rem'
                        }}>
                        <Card
                            sx={{
                                padding: '.2rem',
                                textAlign: 'center',
                                backgroundColor: 'blanchedalmond'
                            }}>
                            <Typography variant="h6" sx={{ fontFamily: 'Roboto, sans-serif' }}>Format Descriptions</Typography>
                        </Card>
                        <Typography variant="body2" sx={{ marginTop: '1rem' }}>
                            <Box sx={{ marginBottom: '1rem' }}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1"><b>Single Week 4 Best Scores</b></Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2">
                                            Users choose 8 golfers tiered out by odds obtained from Draftkings. Each tiered
                                            requires a certain number of selections. Golfers cut on the weekend
                                            automatically count as +10. The best 4 daily scores count towards the user's
                                            final score
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1"><b>Salary Cap</b></Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2">
                                            Users begin with 100 credits. Golfers are sorted into 4 tiers with each tier
                                            being assigned a monetary value. User's can select as many golfers as they want
                                            until they run out of credits. All golfer scores count in this format and golfers
                                            that are cut receive a +10 for Saturday/Sunday
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1"><b>Multi-Week 4 Best Scores</b></Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2">
                                            Scoring is the same format as Single Week 4 Best Scores. 
                                            This format spans multiple weekends, covering up to the next 
                                            3 tournaments.
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1"><b>Multi-Week Salary Cap</b></Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography variant="body2">
                                            Scoring follows the Single Week Salary Cap format and spans multiple weekends,
                                            covering up to the next 3 tournaments.
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Box
                        sx={{
                            border: '2px solid black',
                            padding: '1.2rem',
                            borderRadius: '8px',
                            overflowY: 'auto',
                            height: '550px',
                            '@media (max-width: 600px)': {
                                mb: '2rem'
                            },
                        }}>
                        <List>
                            {filteredPools.map((pool, index) => {
                                const week1DateISO = pool.tournaments?.[0]?.Starts ?? null;
                                const week1Start = week1DateISO ? new Date(week1DateISO) : null;
                                const currentDate = new Date();
                                const currentDayDate = new Date(currentDate);
                                const isMultiWeek = pool.format === 'Multi-Week' || pool.format === "Multi-Week Salary Cap";
                                
                                const isDisabled = (
                                    (pool.maxUsers !== null && pool.users.length >= pool.maxUsers) ||
                                    (isMultiWeek && week1Start && currentDayDate > week1Start)
                                );

                                return (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            borderBottom: '1px solid black',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            '@media (max-width: 600px)': {
                                                display: 'flex',
                                                flexDirection: 'column',
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant='h6'><b>{pool.poolName}</b></Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography component="span" variant='caption'>
                                                        Format: {pool.format}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant='caption'>
                                                        Users: {pool.users.length} / {pool.maxUsers === null ? 'No Max' : pool.maxUsers}
                                                    </Typography>
                                                    <br />
                                                    <Typography component="span" variant='caption'>
                                                        Buy-In: ${pool.buyIn}
                                                    </Typography>
                                                    <br />
                                                    <Typography variant='caption'>
                                                        Payout Structure: 1st: {pool.payouts[0].first * 100}% / 2nd: {pool.payouts[0].second * 100}% / 3rd: {pool.payouts[0].third * 100}%
                                                    </Typography>
                                                    {isMultiWeek && (
                                                        <>
                                                            <br />
                                                            <Typography component="span" variant='caption'>
                                                                Starts: {formatDate(pool.tournaments[0].Starts)}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </>
                                            }/>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                '& > :not(style) + :not(style)': {
                                                    marginTop: '0.5rem', // Add margin between Button and Typography
                                                },
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={isDisabled}
                                                onClick={() => handleJoinPool(pool)}
                                                sx={{
                                                    marginLeft: 'auto', // Align Button to the right
                                                    backgroundColor: '#222',
                                                    '&:hover': {
                                                        backgroundColor: 'darkgreen',
                                                    },
                                                }}
                                            >
                                                Join
                                            </Button>
                                            {isDisabled && (
                                                <Typography variant="caption" color="error" sx={{ marginTop: '0.5rem' }}>
                                                    {isMultiWeek && currentDayDate > week1Start
                                                        ? 'Multi-week tournament is already in progress'
                                                        : 'Pool full'
                                                    }
                                                </Typography>
                                            )}
                                        </Box>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Grid>
            </Grid>

            {/* Pin Modal */}
            <Modal
                open={pinModalOpen}
                onClose={handleCloseModal}
                aria-labelledby="pin-modal-title"
                aria-describedby="pin-modal-description"
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={pinModalOpen}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '60%',
                            maxWidth: '400px',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: '8px',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="h5" id="pin-modal-title">
                            This pool is private. Please enter the pin to join {selectedPool?.poolName}
                        </Typography>
                        <TextField
                            sx={{ mt: 2 }}
                            label="Pin"
                            type="text"
                            variant="outlined"
                            value={enteredPin}
                            onChange={handlePinInputChange}
                        />
                        <Button
                            sx={{ 
                                mt: 2,
                                mr: 1,
                                ml: 1,
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'darkgreen',
                                } 
                            }}
                            variant="contained"
                            color="primary"
                            onClick={handlePinSubmit}
                        >
                            Join
                        </Button>
                        <Button
                            sx={{ 
                                mt: 2,
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'darkgreen',
                                } 
                            }}
                            variant="contained"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </Container>
    );
}

export default JoinPool;
