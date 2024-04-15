import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header/Header';
import Home from './Components/Home/Home';
import Golfers from './Components/Golfers/Golfers';
import Profile from './Components/Profile/Profile';
import Login from './Components/Login/Login';

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
        <Route path="/" element={<Home />} />
        <Route path="/golfers" element={isLoggedIn ? <Golfers /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Login setIsLoggedIn={setIsLoggedIn} />} />
        {/* Add more routes as needed */}
      </Routes>
    </div>
  );
}

export default App;
