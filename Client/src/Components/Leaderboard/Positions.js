import React from 'react';
import Position from './Position';

function Positions({results}) {
    return (
        <>
            {results.map((position) => (
                <Position position={position} key={position.id}/>
            ))}
        </>
        
    )
}

export default Positions;

