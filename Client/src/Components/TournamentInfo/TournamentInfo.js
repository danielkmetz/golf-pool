import React, {useEffect, useState} from 'react';
import { Container } from '@mui/material';
import { useDispatch } from 'react-redux';
import { getThursdayDate } from '../../actions';

function TournamentInfo() {
    const [tournamentInfo, setTournamentInfo] = useState([]);
    const [thursdayDate, setThursdayDate] = useState(null);
    const [currentTournament, setCurrentTournament] = useState(null);
    

    useEffect(() => {
        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        setThursdayDate(getThursdayDate(currentDay, currentDate));
        
        const scheduleUrl = 
        'https://api.sportsdata.io/golf/v2/json/Tournaments/2024?key=8d248137425947d2928a10896592f0b1';

        async function fetchInfo() { 
            const response = await fetch(scheduleUrl);
            const tournaments = await response.json();

            const thursdayTournament = tournaments.find(tournament => {
                const tournamentDatePart = tournament.StartDate.split('T')[0];
                
                return tournamentDatePart === thursdayDate;
            })
            
            setTournamentInfo(tournaments);
            setCurrentTournament(thursdayTournament)
            console.log(currentTournament)
        }
        fetchInfo();
    }, []);
    
    

    return (
        <>{thursdayDate}</>
    )
};

export default TournamentInfo;

