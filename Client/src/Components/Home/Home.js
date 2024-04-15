import React, { useState } from 'react';
import { Box, Container, Paper, Link, Typography, Button, Grid } from '@mui/material';
import Leaderboard from '../Leaderboard/Leaderboard';
import RulesDialog from './RulesDialog';
import PoolStandings from '../PoolStandings/poolStandings';
import Weather from '../Weather/Weather';
import { selectTournamentInfo, fetchTournamentInfo } from '../../Features/TournamentInfoSlice';
import TournamentInfo from './TournamentInfo';

function Home() {
  const [openRules, setOpenRules] = useState(false);

  const handleOpenRules = () => {
    setOpenRules(true);
  };

  const handleCloseRules = () => {
    setOpenRules(false);
  };

  return (
    <Grid className="home-page" sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Grid sx={{ width: '33%', marginRight: '1rem', marginLeft: "3rem" }}>
        <Leaderboard />
      </Grid>
      <Container sx={{width: "33%", marginTop: "1rem"}}>
        <PoolStandings />
      </Container>
      <Container sx={{marginTop: "2rem", width: "33%"}}>
        <Paper sx={{width: "20%"}}>
          <iframe
            src="https://giphy.com/embed/qAREK41X3nzl6"
            width="480"
            height="320"
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
        <Box>
          <Button variant="contained" onClick={handleOpenRules}>
            View Rules
          </Button>
          <RulesDialog isOpen={openRules} handleClose={handleCloseRules} />
        </Box>
        <Container>
          <TournamentInfo/>
          <Weather />
        </Container>
      </Container>
      <Grid>
      <Typography
        variant="subtitle1"
        sx={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          textAlign: "right",
        }}
      >
        This is a Daniel Kmetz production
      </Typography>
      </Grid>
    </Grid>
  );
}

export default Home;
