import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

function RulesDialog({ isOpen, handleClose }) {
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle><b>Rules</b></DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Golfers are tiered out 1-4 by odds retrieved from DraftKings Sportsbook
        </Typography>
          Please select 8 golfers total
        <Typography>
          - 3 golfers from tier 1
        </Typography>
        <Typography>
          - 2 golfers from tier 2
        </Typography>
        <Typography>
          - 2 golfers from tier 3
        </Typography>
        <Typography>
          - 1 golfer from tier 4
        </Typography>
        <Typography>
          The 4 lowest scores each day will count toawrds your final tournament total
        </Typography>
        <Typography>
          IN THE EVENT OF A TIE:
        </Typography>
        <Typography>
          lowest Sunday score will be used
        </Typography>
        <Typography>
          If the tie remains then lowest Saturday score will be used.
        </Typography>
        <Typography>
          The loser of the tie breaker moves to the following postion
        </Typography>
        <Typography>
        i.e. If there's a tie for 1st, the loser of the tie breaker moves to 2nd, then that person originally in second moves to 3rd.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RulesDialog;
