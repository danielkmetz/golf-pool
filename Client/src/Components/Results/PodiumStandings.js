// PodiumStandings.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const PodiumStandings = ({ topThreeUsers }) => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography 
        variant="h6"
        sx={{
          fontFamily: 'Rock Salt',
          marginBottom: '1rem',
        }}
      >
        Congratulations Winners!
      </Typography>
      {topThreeUsers.map((user, index) => (
        <Typography key={user.username} sx={{marginBottom: '1rem'}}>
          {index + 1}. {user.user.username} - {user.totalScore}
        </Typography>
      ))}
    </Box>
  );
};

export default PodiumStandings;
