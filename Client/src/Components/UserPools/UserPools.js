import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserPools, setPoolName, fetchPoolUsers } from '../../Features/poolsSlice';
import { fetchUsers } from '../../Features/userSlice';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Box, IconButton, Container } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

function UserPools() {
  const userPools = useSelector(selectUserPools);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoToStandings = async (poolName) => {
    await dispatch(setPoolName(poolName));
    await dispatch(fetchPoolUsers(poolName));
    dispatch(fetchUsers());
    navigate('/Standings');
  };

  return (
    <Container maxWidth="md" style={{ marginTop: 30 }}>
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', backgroundColor: 'lightgray', padding: 2, borderRadius: 2 }}>
          My Pools
        </Typography>
      </Box>
      {userPools && userPools.length > 0 ? (
        userPools.map((poolName, index) => (
          <Card key={index} sx={{ marginBottom: 3 }}>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {poolName}
              </Typography>
              <IconButton onClick={() => handleGoToStandings(poolName)}>
                <ChevronRightIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))
      ) : (
        <Box sx={{ textAlign: 'center', padding: 2 }}>
          <Typography variant="body1" color="textSecondary">
            You haven't joined or created any pools yet. Join or create a pool to start playing!
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default UserPools;
