import React, {useEffect, useState} from 'react';
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
        `https://api.sportsdata.io/golf/v2/json/Tournaments/2024?${process.env.REACT_APP_SPORTS_DATA_KEY}`;

        async function fetchInfo() { 
            const response = await fetch(scheduleUrl);
            const tournaments = await response.json();

            const thursdayTournament = tournaments.find(tournament => {
                const tournamentDatePart = tournament.StartDate.split('T')[0];
                
                return tournamentDatePart === thursdayDate;
            })
            
            setTournamentInfo(tournaments);
            setCurrentTournament(thursdayTournament)
        }
        fetchInfo();
    }, []);
    
    return (
        <>{thursdayDate}</>
    )
};

export default TournamentInfo;

