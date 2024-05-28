import React from 'react';
import { Box, Card, CardMedia, Typography } from '@mui/material';

const Video = ({ videoUrl }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
    >
      <Card sx={{ maxWidth: 800 }}>
        <CardMedia
          component="video"
          src={videoUrl}
          controls
          sx={{
            height: 'auto', // Set a fixed height for the video
            width: '100%',
            backgroundColor: 'black',
          }}
        />
      </Card>
    </Box>
  );
};

export default Video;
