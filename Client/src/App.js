import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header/Header';
import Standings from './Components/Standings/Standings';
import Golfers from './Components/Golfers/Golfers';
import Profile from './Components/Profile/Profile';
import Login from './Components/Login/Login';
import News from './Components/News/News';
import UserProfile from './Components/UserProfile/UserProfile';
import HowTo from './Components/HowTo/HowTo';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    setIsLoggedIn(!!authToken);
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    localStorage.removeItem('tournamentInfoCache'); // Clear tournament info cache
    localStorage.removeItem('geoCodeCache'); // Clear geo code cache (if you're using a single cache for all geocodes)
    localStorage.removeItem('weatherCache'); // Clear weather cache
    setIsLoggedIn(false); // Update isLoggedIn state
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header />
      {isLoggedIn && <button onClick={logout}>Logout</button>} {/* Render logout button when user is logged in */}
      <Routes>
        <Route path="/" element={<Standings />} />
        <Route path="/how-to" element={<HowTo />} />
        <Route path='/news' element={<News/>} />
        <Route path="/golfers" element={isLoggedIn ? <Golfers /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/user-profile/:username" element={isLoggedIn ? <UserProfile /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        {/* Add more routes as needed */}
      </Routes>
    </div>
  );
}

export default App;
