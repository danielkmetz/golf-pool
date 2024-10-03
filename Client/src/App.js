import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Components/Header/Header';
import Standings from './Components/Standings/Standings';
import Golfers from './Components/Golfers/Golfers';
import Profile from './Components/Profile/Profile';
import Login from './Components/Login/Login';
import News from './Components/News/News';
import UserProfile from './Components/UserProfile/UserProfile';
import HowTo from './Components/HowTo/HowTo';
import CreatePool from './Components/CreatePool/CreatePool';
import JoinPool from './Components/JoinPool/JoinPool';
import Welcome from './Components/Welcome/Welcome';
import ResetPassword from './Components/ResetPassword/ResetPassword';
import UserPools from './Components/UserPools/UserPools';
import { fetchUsername, selectUsername, fetchUsers, fetchEmail, setIsLoggedIn, selectLoggedIn } from './Features/userSlice';
import {  
  resetPoolUsers, 
  selectPoolName, 
  resetPoolName,  
  resetUserPoolData } from './Features/poolsSlice';
import { fetchPastResults } from './Features/pastResultsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { resetBalance } from './Features/balanceSlice';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useSelector(selectLoggedIn);
  const username = useSelector(selectUsername);
  const poolName = useSelector(selectPoolName);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    setIsLoggedIn(!!authToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUsername());
    }
  }, [dispatch, isLoggedIn]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tournamentInfoCache');
    localStorage.removeItem('geoCodeCache');
    localStorage.removeItem('weatherCache');
    setIsLoggedIn(false);
    dispatch(resetPoolName());
    dispatch(resetPoolUsers());
    dispatch(resetUserPoolData());
    dispatch(resetBalance());
    navigate('/Login');
  };

  useEffect(() => {
    const checkAuthToken = async () => {
      const authToken = await localStorage.getItem('token');
      dispatch(setIsLoggedIn(!!authToken));
    };
    checkAuthToken();
    dispatch(fetchUsers());
}, [username]);

useEffect(() => {
  if (username) {      
    dispatch(fetchEmail(username));
    dispatch(fetchPastResults(username));
  }
}, [username]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} />
      {isLoggedIn && 
        <button 
          onClick={logout} 
          style={{
            position: 'absolute',
            right: 0,
          }}  
        >
          Logout
        </button>}
      <div className="main-content">
      <Routes>
        {poolName ? (
          <>
          <Route path='/Standings' element={<Standings />} />
          <Route path="/golfers" element={<Golfers />} />
          <Route path='/news' element={isLoggedIn ? <News /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/how-to" element={<HowTo />} />
          <Route path="/user-profile/:username" element={<UserProfile />} />
          <Route path="/profile" element={<Profile />} />
          </>
        ) : (
          <>
          <Route path='/' element={<Welcome />} />
          <Route path="/Login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/Create-Pool" element={isLoggedIn ? <CreatePool /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/Join-Pool" element={isLoggedIn ? <JoinPool /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/how-to" element={<HowTo />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/my-pools" element={isLoggedIn ? <UserPools /> : <Login setIsLoggedIn={setIsLoggedIn}/>} />
          </>
        )}
      </Routes>
      </div>
    </div>
  );
}

export default App;


