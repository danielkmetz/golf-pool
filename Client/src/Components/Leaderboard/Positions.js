import React from 'react';
import Position from './Position';

function Positions({results}) {
    return (
        <>
            {results.map((position) => (
                <Position position={position} key={position.dg_id}/>
            ))}
        </>
        
    )
}

export default Positions;

