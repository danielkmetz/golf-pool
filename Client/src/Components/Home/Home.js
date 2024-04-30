import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Link, Typography, Button, Grid, CircularProgress } from '@mui/material';
import Leaderboard from '../Leaderboard/Leaderboard';
import RulesDialog from './RulesDialog';
import PoolStandings from '../PoolStandings/poolStandings';
import Weather from '../Weather/Weather';
import TournamentInfo from './TournamentInfo';

function Home() {
  const [openRules, setOpenRules] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleOpenRules = () => {
    setOpenRules(true);
  };

  const handleCloseRules = () => {
    setOpenRules(false);
  };

  useEffect(() => {
    // Simulate data fetching with a timer
    const timer = setTimeout(() => {
      setLoading(false); // Set loading to false after data is 'fetched'
    }, 2000); // 2000 ms delay to mimic fetch delay

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid item xs={12} md={4} sx={{marginTop: "1rem"}}>
            <Leaderboard />
          </Grid>
          <Grid item xs={12} md={4} sx={{marginTop: "1rem"}}>
            <PoolStandings />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{marginTop: "1rem"}}>
              <iframe
                src="https://giphy.com/embed/qAREK41X3nzl6"
                width="100%"
                height="100%"
                frameBorder="0"
                className="giphy-embed"
                title="Giphy Embed"
                allowFullScreen
              ></iframe>
              <Typography variant="body1" align="center" gutterBottom>
                <Link
                  href="https://giphy.com/gifs/comedy-golf-adam-sandler-qAREK41X3nzl6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  via GIPHY
                </Link>
              </Typography>
            </Paper>
            <Box mt={2}>
              <Button variant="contained" onClick={handleOpenRules} fullWidth>
                View Rules
              </Button>
              <RulesDialog isOpen={openRules} handleClose={handleCloseRules} />
            </Box>
            <Container>
              <TournamentInfo />
              <Weather />
            </Container>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="subtitle1"
              align="right"
              sx={{
                textAlign: 'right',
              }}
            >
              This is a Daniel Kmetz production
            </Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default Home;
