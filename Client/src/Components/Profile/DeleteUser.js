import React, { useState } from 'react';
import { Modal, Box, Typography, Button, CircularProgress, Backdrop } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUserMessages } from '../../Features/chatSlice';
import { deleteUserPastResults } from '../../Features/pastResultsSlice';
import { deleteAllUserPicks } from '../../Features/myPicksSlice';
import { useNavigate } from 'react-router-dom';
import { deleteUserBalance } from '../../Features/balanceSlice';
import { setIsLoggedIn } from '../../Features/userSlice';
import axios from 'axios';
import { selectPoolName } from '../../Features/poolsSlice';

const DeleteUser = ({ username, visible, onClose, onSuccess, balance, email }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const poolName = useSelector(selectPoolName);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Attempt to delete user messages
      try {
        await dispatch(deleteUserMessages(username)).unwrap();
      } catch (err) {
        console.log('No messages to delete or failed to delete messages:', err);
      }
  
      // Attempt to delete user past results
      try {
        await dispatch(deleteUserPastResults({ username })).unwrap();
      } catch (err) {
        console.log('No past results to delete or failed to delete past results:', err);
      }
  
      // Attempt to delete all user picks
      try {
        await dispatch(deleteAllUserPicks(username)).unwrap();
      } catch (err) {
        console.log('No picks to delete or failed to delete picks:', err);
      }
  
      // Attempt to delete user balance
      try {
        await dispatch(deleteUserBalance({ username, email })).unwrap();
      } catch (err) {
        console.log('No balance to delete or failed to delete balance:', err);
      }
  
      // Delete the user from the database
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/users/${username}`);
      if (response.status === 200) {
        onSuccess();
        onClose();
  
        // Clear local storage and reset login status
        localStorage.removeItem('token');
        localStorage.removeItem('weatherCache');
        dispatch(setIsLoggedIn(false));
  
        // Navigate to the homepage after successful deletion
        navigate('/');
      }
    } catch (err) {
      setError('Failed to delete the user. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      open={visible}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" sx={{textAlign: 'center'}}>
          Delete User
        </Typography>
        {balance > 0 ? (
          <>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Please withdraw your funds before deleting your account
            </Typography>
            <Button onClick={onClose} variant="contained" sx={{ mt: 3 }}>
              Close
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
              Are you sure you want to delete the user account for {username}?
            </Typography>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={onClose} variant="contained" disabled={loading} sx={{backgroundColor: '#222'}}>
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="contained" color="error" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DeleteUser;
