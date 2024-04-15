import React from 'react';
import { TableRow,  TableCell} from '@mui/material';


const Position = ({position}) => {
    let name = position.player_name;
    let teeTime = position.r1_teetime;
    let id = position.dg_id;
    

    return (
        <TableRow key={id}>
            <TableCell>{name}</TableCell>
            <TableCell>{teeTime}</TableCell>
        </TableRow>
    )
}

export default Position;

