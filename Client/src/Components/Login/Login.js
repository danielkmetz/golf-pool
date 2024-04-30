import React, { useState } from 'react';
import { Button, Container, TextField, Typography } from '@mui/material';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        localStorage.setItem('token', data.token);
        setMessage('Login successful');
      } else {
        setMessage(data.message || 'Error logging in');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error logging in');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
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
        {/* Display email input only when registering */}
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
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, px: 6 }}>
          {isRegistering ? 'Register' : 'Login'}
        </Button>
        <Button
          type="button"
          variant="outlined"
          sx={{
            mt: 2,
            color: 'white',
            backgroundColor: 'purple',
            '&:hover': {
              backgroundColor: 'purple',
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
    </Container>
  );
};

export default Login;
