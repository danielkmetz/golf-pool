import React, { useEffect, useState } from 'react';
import { Container, MenuItem, Select, InputLabel, Typography, Paper } from '@mui/material';
import {
  selectOddsResults,
  fetchOdds,
  selectTier1Results,
  setTier1Results,
  selectTier2Results,
  setTier2Results,
  selectTier3Results,
  setTier3Results,
  selectTier4Results,
  setTier4Results,
  filterGolferFromTier,
} from '../../Features/bettingOddsSlice';
import { useDispatch, useSelector } from 'react-redux';
import BettingOdds from './bettingOdds';
import {
  addTier1Golfer,
  addTier2Golfer,
  addTier3Golfer,
  addTier4Golfer,
  selectTier1Picks,
  selectTier2Picks,
  selectTier3Picks,
  selectTier4Picks,
} from '../../Features/myPicksSlice';

function Tier1() {
  const dispatch = useDispatch();
  let oddsResults = useSelector(selectOddsResults);
  let tier1Results = useSelector(selectTier1Results);
  let tier2Results = useSelector(selectTier2Results);
  let tier3Results = useSelector(selectTier3Results);
  let tier4Results = useSelector(selectTier4Results);
  const tier1Picks = useSelector(selectTier1Picks);
  const tier2Picks = useSelector(selectTier2Picks);
  const tier3Picks = useSelector(selectTier3Picks);
  const tier4Picks = useSelector(selectTier4Picks);
  const [selectedOption, setSelectedOption] = useState('');
  
  useEffect(() => {
    dispatch(fetchOdds());
  }, [dispatch]);

  
  const handleOptionChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    if (selectedValue === 'Tier1') {
      dispatch(setTier1Results());
    }
    if (selectedValue === 'Tier2') {
      dispatch(setTier2Results());
    }
    if (selectedValue === 'Tier3') {
      dispatch(setTier3Results());
    }
    if (selectedValue === 'Tier4') {
      dispatch(setTier4Results());
    }
  };

  function addGolfer(golfer) {
    if (selectedOption === 'Tier1' && tier1Picks.length < 3) {
      dispatch(addTier1Golfer(golfer));
      dispatch(filterGolferFromTier({ tier: 'Tier1', golferName: golfer}))
    }
    if (selectedOption === 'Tier2' && tier2Picks.length < 2) {
      dispatch(addTier2Golfer(golfer));
      dispatch(filterGolferFromTier({ tier: 'Tier2', golferName: golfer}))
    }
    if (selectedOption === 'Tier3' && tier3Picks.length < 2) {
      dispatch(addTier3Golfer(golfer));
      dispatch(filterGolferFromTier({tier: 'Tier3', golferName: golfer}))
    }
    if (selectedOption === 'Tier4' && tier4Picks.length < 1) {
      dispatch(addTier4Golfer(golfer));
      dispatch(filterGolferFromTier({ tier: 'Tier4', golferName: golfer}))
    }
  }

  const containerStyle = {
    marginTop: '2rem',
    height: '70vh',
    overflow: 'auto',
    marginRight: '2rem',
  };

  const selectContainerStyle = {
    marginBottom: '1rem',
    width: '100%',
  };

  const oddsContainerStyle = {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  };

  return (
    <Container style={containerStyle}>
      <InputLabel id="select-label">Select Tier</InputLabel>
      <Select
        value={selectedOption}
        onChange={handleOptionChange}
        label="Select Tier"
        labelId="select-label"
        style={selectContainerStyle}
        displayEmpty
        renderValue={(value) => (value ? value : 'Choose Tier')}
      >
        <MenuItem value="">Choose Tier</MenuItem>
        <MenuItem value="Tier1">Tier 1 Golfers</MenuItem>
        <MenuItem value="Tier2">Tier 2 Golfers</MenuItem>
        <MenuItem value="Tier3">Tier 3 Golfers</MenuItem>
        <MenuItem value="Tier4">Tier 4 Golfers</MenuItem>
      </Select>
      {selectedOption && (
        <Paper elevation={3} style={oddsContainerStyle}>
          <Typography variant="h5" gutterBottom>
            {selectedOption === 'Tier2'
              ? 'Tier 2 Golfers (PICK 2)'
              : selectedOption === 'Tier3'
              ? 'Tier 3 Golfers (PICK 2)'
              : selectedOption === 'Tier4'
              ? 'Tier 4 Golfers (PICK 1)'
              : 'Tier 1 Golfers (PICK 3)'}
          </Typography>
          {selectedOption === 'Tier2' ? (
            <BettingOdds oddsResults={tier2Results} addGolfer={addGolfer} />
          ) : selectedOption === 'Tier3' ? (
            <BettingOdds oddsResults={tier3Results} addGolfer={addGolfer} />
          ) : selectedOption === 'Tier4' ? (
            <BettingOdds oddsResults={tier4Results} addGolfer={addGolfer} />
          ) : (
            <BettingOdds oddsResults={tier1Results} addGolfer={addGolfer} />
          )}
        </Paper>
      )}
    </Container>
  );
}

export default Tier1;


