import React, { useEffect, useState } from 'react';
import { Box, Typography, Link, Avatar, Divider } from '@mui/material';
import { fetchUsers, selectUsers } from '../../Features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import {Link as RouterLink} from 'react-router-dom';
import axios from 'axios';

function UserList() {
    const dispatch = useDispatch();
    const [profilePics, setProfilePics] = useState({});
    const users = useSelector(selectUsers);
    
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        const fetchProfilePics = async () => {
            const pics = {};
            for (const user of users) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile-pics/${user.username}`, {
                        responseType: 'arrayBuffer',
                    });
                    pics[user.username] = response.data;
                } catch (error) {
                    console.error(`Error fetching profile picture for ${user.username}:`, error);
                }
            }
            setProfilePics(pics);
        };
        fetchProfilePics();
    }, [users]);

    return (
        <Box>
            <Typography 
                sx={{
                    textAlign: 'center',
                    fontFamily: 'Rock Salt', 
                    backgroundColor: 'LightGray', 
                    padding: '.5rem'
                }}>
                    All Users
            </Typography>
            <Box sx={{ maxHeight: '200px', overflowY: 'scroll', padding: '1rem', }}>
                {users.map(user => (
                    <>
                    <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Typography variant="body1" sx={{ color: 'black', marginRight: '0.5rem', flex: 1, cursor: 'pointer' }}>
                            <Link 
                                sx={{ textDecoration: 'none', color: 'black' }}
                                component={RouterLink}
                                to={`/user-profile/${user.username}`}
                            >
                                {user.username}
                            </Link>
                        </Typography>
                        <Avatar src={`${profilePics[user.username]}`} sx={{ marginLeft: '0.5rem' }} />
                    </Box>
                    <Divider sx={{ backgroundColor: 'rgba(0, 0, 0, 0.12)', height: '1px', width: '100%', marginY: '0.5rem' }} />
                    </>
                ))}
            </Box>
        </Box>
    );
}

export default UserList;
