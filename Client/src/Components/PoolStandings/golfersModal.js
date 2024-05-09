import React, { useEffect, useState } from 'react';
import { Modal, Fade, CircularProgress} from '@mui/material';
import './modal.css';
import { fetchLeaderboard, selectResults, fetchLiveModel, selectLiveResults
    } from '../../Features/LeaderboardSlice';
import { useDispatch, useSelector } from 'react-redux';
import ModalTable from './modalTable';
import { fetchUserPicks, selectAllPicks } from '../../Features/myPicksSlice';
import { fetchTournamentInfo, 
    selectTournamentInfo } from '../../Features/TournamentInfoSlice';


const GolfersModal = ({ user, isOpen, handleClose }) => {
    const dispatch = useDispatch();
    const results = useSelector(selectResults);
    const allUserPicks = useSelector(selectAllPicks);
    const liveResults = useSelector(selectLiveResults);
    const tournamentInfo = useSelector(selectTournamentInfo);
    const [tier1, setTier1] = useState([]);
    const [tier2, setTier2] = useState([]);
    const [tier3, setTier3] = useState([]);
    const [tier4, setTier4] = useState([]);
    const [loading, setLoading] = useState([]);

    //fetch user golfers and organize into their tiers
    useEffect(() => {
        setLoading(true)
        const fetchData = async () => {
            if (user) {
                try {
                    await dispatch(fetchUserPicks(user));
                    setLoading(false)
                } catch (error) {
                    console.error('Error fetching user picks:', error);
                    setLoading(false)
                }
            }
        };
        fetchData();
    }, [dispatch, user]);

    useEffect(() => {
        setLoading(true)
        if (allUserPicks && allUserPicks.length >= 4) {
            const tier1Array = allUserPicks[0].golferName.map(name => name);
            const tier2Array = allUserPicks[1].golferName.map(name => name);
            const tier3Array = allUserPicks[2].golferName.map(name => name);
            const tier4Array = allUserPicks[3].golferName.map(name => name);
            setTier1(tier1Array);
            setTier2(tier2Array);
            setTier3(tier3Array);
            setTier4(tier4Array);
            setLoading(false)
        }
    }, [dispatch, allUserPicks]);

    useEffect(() => {
        dispatch(fetchLeaderboard());
        dispatch(fetchLiveModel());
        dispatch(fetchTournamentInfo());
    }, [dispatch])

    const coursePar = tournamentInfo.Par;

    //console.log(tournamentInfo.Par)
    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="popup-title"
            aria-describedby="popup-description"
            closeAfterTransition
        >
            <Fade in={isOpen}>
                <div className={isOpen ? 'modal-container' : 'modal-container hidden'} onClick={handleClose}>
                    {loading ? ( // Conditional rendering based on loading state
                        <div className="loading-container">
                            <CircularProgress /> {/* Loading icon */}
                        </div>
                    ) : (
                        <div className={`modal-content ${isOpen ? '' : 'hidden'}`}>
                            <h2 id="popup-title">Golfers for {user}</h2>
                            <ModalTable 
                                tier1={tier1} 
                                tier2={tier2} 
                                tier3={tier3} 
                                tier4={tier4}
                                liveResults={liveResults}
                                coursePar={coursePar} 
                            />
                        </div>
                    )}
                </div>
            </Fade>
        </Modal>
    );
};

export default GolfersModal;
