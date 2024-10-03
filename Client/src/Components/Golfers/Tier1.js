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
import { selectUserPoolData } from '../../Features/poolsSlice';
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
import { subtractInitialBalance, selectInitialBalance } from '../../Features/poolsSlice';

function Tier1() {
  const dispatch = useDispatch();
  let tier1Results = useSelector(selectTier1Results);
  let tier2Results = useSelector(selectTier2Results);
  let tier3Results = useSelector(selectTier3Results);
  let tier4Results = useSelector(selectTier4Results);
  const tier1Picks = useSelector(selectTier1Picks);
  const tier2Picks = useSelector(selectTier2Picks);
  const tier3Picks = useSelector(selectTier3Picks);
  const tier4Picks = useSelector(selectTier4Picks);
  const poolInfo = useSelector(selectUserPoolData);
  const balance = useSelector(selectInitialBalance);
  const [selectedOption, setSelectedOption] = useState('');

  const format = poolInfo?.format;
  
  useEffect(() => {
    dispatch(fetchOdds());
  }, [dispatch]);
  
  const handleOptionChange = (event) => {
    const value = event.target.value;  // Extract the value from the event
    setSelectedOption(value);
    switch (value) {
      case 'Tier1':
        dispatch(setTier1Results({tier1Picks}));
        break;
      case 'Tier2':
        dispatch(setTier2Results({tier2Picks}));
        break;
      case 'Tier3':
        dispatch(setTier3Results({tier3Picks}));
        break;
      case 'Tier4':
        dispatch(setTier4Results({tier4Picks}));
        break;
      default:
        break;
    }
  };
  
  
  const addGolfer = (golfer) => {
    if (format !== "Salary Cap" && format !== "Multi-Week Salary Cap") {
      switch (selectedOption) {
        case 'Tier1':
          if (tier1Picks.length < 3) {
            dispatch(addTier1Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier1', golferName: golfer }));
          }
          break;
        case 'Tier2':
          if (tier2Picks.length < 2) {
            dispatch(addTier2Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier2', golferName: golfer }));
          }
          break;
        case 'Tier3':
          if (tier3Picks.length < 2) {
            dispatch(addTier3Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier3', golferName: golfer }));
          }
          break;
        case 'Tier4':
          if (tier4Picks.length < 1) {
            dispatch(addTier4Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier4', golferName: golfer }));
          }
          break;
        default:
          break;
      }
    } else {
      switch (selectedOption) {
        case 'Tier1':
          if (balance >= 25) {
            dispatch(addTier1Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier1', golferName: golfer }));
            dispatch(subtractInitialBalance(25))
          }
          break;
        case 'Tier2':
          if (balance >= 15) {
            dispatch(addTier2Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier2', golferName: golfer }));
            dispatch(subtractInitialBalance(15))
          }
          break;
        case 'Tier3':
          if (balance >= 10) {
            dispatch(addTier3Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier3', golferName: golfer }));
            dispatch(subtractInitialBalance(10))
          }
          break;
        case 'Tier4':
          if (balance >= 5) {
            dispatch(addTier4Golfer(golfer));
            dispatch(filterGolferFromTier({ tier: 'Tier4', golferName: golfer }));
            dispatch(subtractInitialBalance(5));
          }
          break;
        default:
          break;
      }
    }
  }

  const containerStyle = {
    marginTop: '2rem',
    height: '70vh',
    marginRight: '2rem',
  };

  const selectContainerStyle = {
    marginBottom: '1rem',
    width: '100%',
  };

  const oddsContainerStyle = {
    marginTop: '.5rem',
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    overflow: 'auto',
    height: '57vh',
  };

  return (
    <Container 
      style={containerStyle}
      sx={{
        '@media (max-width: 600px)': {
            mb: '3rem',
          },
      }}
    >
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
          {format === "Salary Cap" || format === "Multi-Week Salary Cap" ?
            null :
            <Typography variant="h5" gutterBottom sx={{textDecoration: 'underline'}}>
              {selectedOption === 'Tier2'
                ? 'Pick 2 from Tier 2'
                : selectedOption === 'Tier3'
                ? 'Pick 2 from Tier 3'
                : selectedOption === 'Tier4'
                ? 'Pick 1 from Tier 4'
                : 'Pick 3 from Tier 1'}
            </Typography>
          }
          {selectedOption === 'Tier2' ? (
            <BettingOdds oddsResults={tier2Results} addGolfer={addGolfer} format={format} tier={"Tier2"}/>
          ) : selectedOption === 'Tier3' ? (
            <BettingOdds oddsResults={tier3Results} addGolfer={addGolfer} format={format} tier={"Tier3"}/>
          ) : selectedOption === 'Tier4' ? (
            <BettingOdds oddsResults={tier4Results} addGolfer={addGolfer} format={format} tier={"Tier4"}/>
          ) : (
            <BettingOdds oddsResults={tier1Results} addGolfer={addGolfer} format={format} tier={"Tier1"}/>
          )}
        </Paper>
      )}
    </Container>
  );
}

export default Tier1;


