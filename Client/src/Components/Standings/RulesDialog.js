import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { selectUserPoolData } from '../../Features/poolsSlice';
import { useSelector } from 'react-redux';

function RulesDialog({ isOpen, handleClose }) {
  const info = useSelector(selectUserPoolData);
  const format = info.format;

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle><b>Rules for {format} format</b></DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Golfers are tiered out 1-4 by odds retrieved from DraftKings Sportsbook
        </Typography>
        {format !== "Salary Cap" ?
        <> 
          <Typography>
          Please select 8 golfers total
          </Typography>
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
        </> :
          <>
            <Typography>
              Each tier is assigned a monetary value. Each user has a max budget of 100 credits 
              to spend on their team of golfers. The amount of golfers a user picks will depend on
              how they deploy their 100 credits. Some users may spend more on tier 1 golfers while
              others spread out their credits among the other tiers. 
            </Typography>
            <Typography>
              <b>All golfers scores are counted</b>
            </Typography>
            <Typography>
              Golfers that are cut automomatically receive a +10
            </Typography>
            <Typography>
              Cuts will have a much larger impact on user's with smaller teams
            </Typography>
          </>     
        }
        <Typography>
          <b>IN THE EVENT OF A TIE:</b>
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
        <Button 
          onClick={handleClose} 
          sx={{
            backgroundColor: '#222', 
            color: 'white',
            '&:hover': {
              backgroundColor: '#004d00',
            }
            }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RulesDialog;
