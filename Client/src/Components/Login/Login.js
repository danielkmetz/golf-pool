import React, { useState } from 'react';
import { Button, Container, TextField, Typography, Box, FormControlLabel, Checkbox } from '@mui/material';
import { fetchPoolName, fetchUserPools } from '../../Features/poolsSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { fetchUsername } from '../../Features/userSlice';
import TigerFistPump from '../../Resources/Tiger_fist_pump.jpg';
import Scottie from '../../Resources/Scottie.jpg';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    const trimmedUsername = username.trim();

    try {
      const response = await axios.post(
        `${API_URL}/login`,
        {
          username: trimmedUsername,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        const { token } = response.data;
        dispatch(fetchUserPools(trimmedUsername));
        dispatch(setIsLoggedIn(true));
        setMessage('Login successful');
        navigate('/my-pools')
        await localStorage.setItem('token', token);
        await dispatch(fetchUsername());
        
      } else {
        setMessage(response.data.message || 'Error logging in');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.response?.data?.message || 'Error logging in');
    }
  };

  const handleRegister = async () => {
    const trimmedUsername = username.trim();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    // Ensure emails match
    if (email !== confirmEmail) {
      setMessage('Emails do not match');
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setMessage('Invalid email format');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmedUsername, password, email }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsRegistering(false);
        setMessage('User registered successfully');
      } else {
        setMessage(data.message || 'Error registering user');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error registering user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
       <style>
        {`
          html, body {
            overflow: hidden !important;
          }
        `}
      </style>
      <Box
        component="img"
        src={Scottie}
        alt="Background"
        sx={{
          position: 'absolute',
          left: '-2.5%',
          top: '12%',
          height: '90%',
          width: '50%',
          maxWidth: '40%',
          maxHeight: 'calc(100vh - 10%)',
          opacity: 0.5,
          zIndex: -1,
          '@media (max-width: 600px)': {
            display: 'none',
          },
        }}
      />
      {isRegistering ? (
        <Typography variant="h2" sx={{ fontFamily: 'Rock Salt', marginBottom: '2rem' }}>
          Register
        </Typography>
      ) : (
        <Typography variant="h1" sx={{ fontFamily: 'Rock Salt', marginBottom: '2rem' }}>
          Login
        </Typography>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          type="text"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="outlined"
          margin="normal"
          
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          margin="normal"
          
        />
        {isRegistering && (
          <>
          <TextField
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            
          />
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          <TextField
            type="email"
            label="Confirm Email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          </>
        )}
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ 
            mt: 2, 
            px: 6,
            backgroundColor: '#222',
            '&:hover': {
              backgroundColor: 'DarkGreen',
            } 
            }}>
          {isRegistering ? 'Register' : 'Login'}
        </Button>
        <Button
          type="button"
          variant="outlined"
          sx={{
            mt: 2,
            color: 'white',
            backgroundColor: 'DarkGreen',
            '&:hover': {
              backgroundColor: 'lightgreen',
            },
          }}
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Back to Login' : 'Register Instead'}
        </Button>
      </form>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message}
      </Typography>
      <Box
        component="img"
        src={TigerFistPump} // Replace with the URL of your image
        alt="Background"
        sx={{
          position: 'absolute',
          right: '-2%',
          bottom: '-2.5%',
          height: '90%',
          maxWidth: '40%',
          maxHeight: '100vh',
          opacity: 0.5,
          zIndex: -1,
          '@media (max-width: 600px)': {
            display: 'none',
          },
        }}
      />
    </Container>
  );
};

export default Login;
