import React, { useEffect, useMemo } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { fetchLiveModel, selectLiveResults } from '../../Features/LeaderboardSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useMediaQuery } from '@mui/material';

function removeT(value) {
    if (typeof value === 'string' && value.startsWith('T')) {
        return parseInt(value.substring(1));
    }
    return value;
}

function addT(value, currentPos, sortedResults) {
    if (currentPos === "CUT") {
      return value; // Return the value as is if the current position is "CUT"
    }
  
    const tiedPositions = sortedResults.filter(golfer => golfer.current_pos === currentPos);
    if (tiedPositions.length > 1) {
      if (typeof value === "number") {
        return `T${value}`;
      } else if (typeof value === "string" && !value.startsWith("T") && value !== "--") {
        return `T${value}`;
      }
    }
  
    return value;
}

function Rounds() {
    const liveResults = useSelector(selectLiveResults);
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width:600px)'); // Adjust the max-width as needed

    useEffect(() => {
        dispatch(fetchLiveModel());
    }, [dispatch]);

    const sortedResults = useMemo(() => {
        const cutGolfers = liveResults.filter(golfer => golfer.current_pos === "CUT");
        const nonCutGolfers = liveResults.filter(golfer => golfer.current_pos !== "CUT");
      
        const sortedNonCutGolfers = nonCutGolfers.slice().sort((a, b) => {
          const valueA = removeT(a.current_pos);
          const valueB = removeT(b.current_pos);
      
          if (valueA === "--") {
            return 1;
          } else if (valueB === "--") {
            return -1;
          }
          return valueA - valueB;
        });
        const sortedCutGolfers = cutGolfers.slice().sort((a, b) => {
          const totalA = a.R1 + a.R2 + a.R3 + a.R4;
          const totalB = b.R1 + b.R2 + b.R3 + b.R4;
      
          return totalA - totalB;
        });
      
        return [...sortedNonCutGolfers, ...sortedCutGolfers];
      }, [liveResults]);
        
    const fontSize = isMobile ? '10px' : '12px';

    return (
        <>
            {sortedResults.map((golfer) => (
                <TableRow key={golfer.player_name}>
                    <TableCell sx={{ fontSize }}>{golfer.player_name}</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{addT(golfer.current_pos, golfer.current_pos, sortedResults)}</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{
                        golfer.current_score === 0 ?
                        "E" : golfer.current_score > 0 ? 
                        `+${golfer.current_score}` : 
                        golfer.current_score
                    }</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{golfer.thru === 0 ? null : golfer.thru}</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{
                        golfer.today === 0 ?
                        "E" : golfer.today > 0 ? 
                        `+${golfer.today}` : 
                        golfer.today
                    }</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{golfer.R1}</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{golfer.R2}</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{golfer.R3}</TableCell>
                    <TableCell sx={{ fontSize, paddingLeft: '.5px' }}>{golfer.R4}</TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default Rounds;
