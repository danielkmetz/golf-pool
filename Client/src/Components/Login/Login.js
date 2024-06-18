import React, { useState } from 'react';
import { Button, Container, TextField, Typography, Box } from '@mui/material';
import { fetchPoolName } from '../../Features/poolsSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import TigerFistPump from '../../Resources/Tiger_fist_pump.jpg';
import Scottie from '../../Resources/Scottie.jpg';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: trimmedUsername, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        setMessage('Login successful');
        const result = await dispatch(fetchPoolName(trimmedUsername));
        if (result.payload.message === "User not found in any pool") {
          navigate('/Join-Pool');
        } else {
          navigate('/Standings');
        }
      } else {
        setMessage(data.message || 'Error logging in');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error logging in');
    }
  };

  const handleRegister = async () => {
    const trimmedUsername = username.trim();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
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
          fullWidth
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          margin="normal"
          fullWidth
        />
        {isRegistering && (
          <TextField
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            fullWidth
          />
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
