import React from 'react';
import { Container, Typography, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GolfBackground from './misty-golf-course.jpg'; 

const WelcomePage = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${GolfBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        paddingTop: '2rem',
      }}
    >
      <Container maxWidth="lg" >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', 
            marginBottom: 2,
            overflow: 'auto',
            maxHeight: '100%',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.4)' }}
          >
            Welcome to The Golf Pool
          </Typography>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Increase opacity for better text contrast
            marginBottom: 2,
          }}
        >
        <Paper>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9)' }}
          >
            Join or create a pool and pick your favorite golfers for the upcoming PGA tournament.
          </Typography>
          <Typography
            variant="body1"
            sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9)', padding: 2 }}
          >
            Compete with friends and other golf enthusiasts to see who can assemble the best team of golfers. Choose
            different scoring formats when joining or creating a pool. 
            Track live scores and see your picks' performance throughout the tournament. The user with the lowest 
            total score at the end wins the pool and the cash prize!
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                component={Link}
                to="/join-pool"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SportsGolfIcon />}
                sx={{
                  marginTop: 2,
                  marginBottom: 2,
                  backgroundColor: 'DarkGreen',
                  '&:hover': {
                    backgroundColor: 'green',
                  }
                }}
              >
                Join an Existing Pool
              </Button>
            </Grid>
            <Grid item>
              <Button
                component={Link}
                to="/create-pool"
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  marginTop: 2,
                  marginBottom: 2,
                  backgroundColor: 'DarkGreen',
                  '&:hover': {
                    backgroundColor: 'green',
                  }
                }}
              >
                Create a New Pool
              </Button>
            </Grid>
          </Grid>
          </Paper>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Increase opacity for better text contrast
            marginBottom: '9.05rem'
          }}
        >
        <Paper>
          <Typography variant="h4" gutterBottom sx={{ textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9)' }}>
            Key Features
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={4} sx={{ marginBottom: 2 }}>
              <Typography variant="h6">
                <SportsGolfIcon /> Live Score & Weather Tracking
              </Typography>
              <Typography variant="body1">
                Follow your golfers' scores & hourly weather in real-time and stay updated throughout the tournament.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ marginBottom: 2 }}>
              <Typography variant="h6">
                <AddCircleOutlineIcon /> Multiple Scoring Formats
              </Typography>
              <Typography variant="body1">
                Users can create or join pools with different formats that include:
              </Typography>
              <Typography variant="body2">
                - Single Week Tourney 4 Best Scores
              </Typography>
              <Typography variant="body1">
                - Single Week Salary 
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ marginBottom: 2, paddingRight: '1rem' }}>
              <Typography variant="h6">
                <SportsGolfIcon /> Leave buyins and payouts to us
              </Typography>
              <Typography variant="body1">
                Users are charged their buyin securely when they make there golfer selections and paid out at
                the conclusion of the tournament by us
              </Typography>
            </Grid>
          </Grid>
        </Paper>
        </Paper>
      </Container>
    </div>
  );
};

export default WelcomePage;
