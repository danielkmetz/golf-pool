import React, { useEffect, useMemo } from 'react';
import { TableRow, TableCell } from '@mui/material';
import { selectResults, fetchLiveModel, selectLiveResults } from '../../Features/LeaderboardSlice';
import { useSelector, useDispatch } from 'react-redux';

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

    useEffect(() => {
        dispatch(fetchLiveModel());
    }, [dispatch])
    console.log(liveResults);
    // Create a new array with modified current_pos values for sorting
    const sortedResults = useMemo(() => {
        const cutGolfers = liveResults.filter(golfer => golfer.current_pos === "CUT");
        const nonCutGolfers = liveResults.filter(golfer => golfer.current_pos !== "CUT");
      
        const sortedNonCutGolfers = nonCutGolfers.slice().sort((a, b) => {
          const valueA = removeT(a.current_pos);
          const valueB = removeT(b.current_pos);
      
          // Handle "--" values by placing them at the end of the sort
          if (valueA === "--") {
            return 1;
          } else if (valueB === "--") {
            return -1;
          }
          // Compare numeric values for other positions
          return valueA - valueB;
        });
        const sortedCutGolfers = cutGolfers.slice().sort((a, b) => {
          const totalA = a.R1 + a.R2 + a.R3 + a.R4;
          const totalB = b.R1 + b.R2 + b.R3 + b.R4;
      
          return totalA - totalB;
        });
      
        return [...sortedNonCutGolfers, ...sortedCutGolfers];
      }, [liveResults]);
        
      

    return (
        <>
            {sortedResults.map((golfer) => (
                <TableRow key={golfer.player_name}>
                    <TableCell>{golfer.player_name}</TableCell>
                    <TableCell>{addT(golfer.current_pos, golfer.current_pos, sortedResults)}</TableCell>
                    <TableCell>{golfer.thru === 0 ? null : golfer.thru}</TableCell>
                    <TableCell>{
                        golfer.today === 0 ?
                        "E" : golfer.today > 0 ? 
                        `+${golfer.today}` : 
                        golfer.today
                    }</TableCell>
                    <TableCell>{golfer.R1}</TableCell>
                    <TableCell>{golfer.R2}</TableCell>
                    <TableCell>{golfer.R3}</TableCell>
                    <TableCell>{golfer.R4}</TableCell>
                    <TableCell>{golfer.R1 + golfer.R2 + golfer.R3 + golfer.R4 === 0 ?
                        null : golfer.R1 + golfer.R2 + golfer.R3 + golfer.R4}</TableCell>
                </TableRow>
            ))}
        </>
    )
}

export default Rounds;
