import React, {useEffect, useState} from 'react';
import { Container, MenuItem, Select, InputLabel } from '@mui/material';
import { selectOddsResults, 
    fetchOdds, 
    selectTier1Results,
    setTier1Results,
    selectTier2Results,
    setTier2Results,
    selectTier3Results,
    setTier3Results,
    selectTier4Results,
    setTier4Results, 
} from '../../Features/bettingOddsSlice';
import { useDispatch, useSelector } from 'react-redux';
import BettingOdds from './bettingOdds';
import { 
    addTier1Golfer, 
    addTier2Golfer, 
    addTier3Golfer, 
    addTier4Golfer } from '../../Features/myPicksSlice';

function Tier1() {
    const dispatch = useDispatch();
    let oddsResults = useSelector(selectOddsResults);
    let tier1Results = useSelector(selectTier1Results);
    let tier2Results = useSelector(selectTier2Results);
    let tier3Results = useSelector(selectTier3Results);
    let tier4Results = useSelector(selectTier4Results);
    const [selectedOption, setSelectedOption] = useState('');
    const currentDate = new Date();
    const currentDay = currentDate.getDay();

    useEffect(() => {
        dispatch(fetchOdds());
    }, [dispatch]);

    const handleOptionChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedOption(selectedValue)
         console.log(selectedOption)
        if (selectedValue === "Tier1") {
            dispatch(setTier1Results());
        }
        if (selectedValue === "Tier2") {
            dispatch(setTier2Results());
        }
        if (selectedValue === "Tier3") {
            dispatch(setTier3Results());
        }
        if (selectedValue === "Tier4") {
            dispatch(setTier4Results());
        }
    }

    function addGolfer(golfer) {
        if (selectedOption === "Tier1") {
            dispatch(addTier1Golfer(golfer));
        }
        if (selectedOption === "Tier2") {
            dispatch(addTier2Golfer(golfer))
        }
        if (selectedOption === "Tier3") {
            dispatch(addTier3Golfer(golfer))
        }
        if (selectedOption === "Tier4") {
            dispatch(addTier4Golfer(golfer))
        } 
    };
    
    return (
        <Container sx={{marginTop: "2rem", height: "100vh", overflow: "auto", marginRight: "2rem"}}>
            <InputLabel id="select-label">Select Tier</InputLabel>
           <Select value={selectedOption} onChange={handleOptionChange} label="Select Tier" labelId="select-label">
                <MenuItem value="Tier1">Tier 1 Golfers</MenuItem>
                <MenuItem value="Tier2">Tier 2 Golfers</MenuItem>
                <MenuItem value="Tier3">Tier 3 Golfers</MenuItem>
                <MenuItem value="Tier4">Tier 4 Golfers</MenuItem>
           </Select>
            <Container sx={{marginTop: "2rem"}}>
                {
                selectedOption === "Tier2" ? (
                    <BettingOdds oddsResults={tier2Results} addGolfer={addGolfer}/>
                ) : selectedOption === "Tier3" ? (
                    <BettingOdds oddsResults={tier3Results} addGolfer={addGolfer}/>
                ) : selectedOption === "Tier4" ? (
                    <BettingOdds oddsResults={tier4Results} addGolfer={addGolfer}/>
                ) : <BettingOdds oddsResults={tier1Results} addGolfer={addGolfer}/>
            }
            </Container>
        </Container>
    )
};



export default Tier1;