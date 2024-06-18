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
import { fetchUsername, selectUsername } from './Features/userSlice';
import { fetchPoolUsers, resetPoolUsers, selectPoolName, fetchPoolName, resetPoolName, selectPoolUsers } from './Features/poolsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    if (username) {
      dispatch(fetchPoolName(username));
    }
  }, [dispatch, username]);

  useEffect(() => {
    if (poolName) {
      dispatch(fetchPoolUsers(poolName));
    }
  }, [dispatch, poolName]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tournamentInfoCache');
    localStorage.removeItem('geoCodeCache');
    localStorage.removeItem('weatherCache');
    setIsLoggedIn(false);
    dispatch(resetPoolName());
    dispatch(resetPoolUsers());
    navigate('/Login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} />
      {isLoggedIn && <button onClick={logout} >Logout</button>}
      <div className="main-content">
        <Routes>
          <Route path='/' element={<Welcome />} />
          <Route path="/Login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/Create-Pool" element={isLoggedIn ? <CreatePool /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/Join-Pool" element={isLoggedIn ? <JoinPool /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/Standings" element={isLoggedIn ? <Standings /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/how-to" element={isLoggedIn ? <HowTo /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path='/news' element={isLoggedIn ? <News /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/golfers" element={isLoggedIn ? <Golfers /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/user-profile/:username" element={isLoggedIn ? <UserProfile /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
