import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/reset-password`, {
        token,
        password,
      });

      if (response.data.success) {
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => {
          navigate('/Login');
        }, 3000); // Redirect to login after 3 seconds
      } else {
        setMessage(response.data.message || 'Error resetting password');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred while resetting your password.');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom align="center">
        Reset Password
      </Typography>
      {message && (
        <Alert severity={message.includes('successful') ? 'success' : 'error'} style={{ marginBottom: '20px' }}>
          {message}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
      </form>
    </Container>
  );
};

export default ResetPassword;
