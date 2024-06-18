import React from 'react';
import { Container, Modal, Box } from '@mui/material';
import PodiumStandings from './PodiumStandings';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  textAlign: 'center'
};

const Results = ({ podiumOpen, handlePodiumClose, topThreeUsers }) => {
  return (
    <Container>
      <Modal
        open={podiumOpen}
        onClose={handlePodiumClose}
      >
        <Box sx={style}>
          <PodiumStandings topThreeUsers={topThreeUsers} />
        </Box>
      </Modal>
    </Container>
  );
};

export default Results;
