import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { Drawer, TextField, List, ListItem, ListItemText, Button, Box, Container, Avatar, ListItemAvatar, useMediaQuery } from '@mui/material';
import { selectPoolName } from '../../Features/poolsSlice';
import { selectUsername, selectProfilePics, selectTimestamp, updateLastReadTimestamp, fetchTimestamp } from '../../Features/userSlice';
import { 
    selectMessages, 
    selectChatStatus, 
    selectChatError, 
    fetchMessages, 
    addMessage } from '../../Features/chatSlice';
import './Chat.css';

const socket = io(`${process.env.REACT_APP_CHAT_URL}`);

function Chat() {
    const dispatch = useDispatch();
    const poolName = useSelector(selectPoolName);
    const username = useSelector(selectUsername);
    const messages = useSelector(selectMessages);
    const status = useSelector(selectChatStatus);
    const error = useSelector(selectChatError);
    const profilePics = useSelector(selectProfilePics);
    const timestamp = useSelector(selectTimestamp);
    const lastMessageTimestamp = messages[messages.length - 1]?.timestamp;
    const [unread, setUnread] = useState(false);

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const messagesEndRef = useRef(null);

    const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    useEffect(() => {
        dispatch(fetchMessages(poolName));
    }, [open, dispatch, poolName]);

    useEffect(() => {
        dispatch(fetchTimestamp(username));
    }, [dispatch, messages, username]);

    useEffect(() => {
        if (timestamp < lastMessageTimestamp && !open && messages.length > 0) {
            setUnread(true);
        }
    }, [messages, timestamp, ]);

    useEffect(() => {
        if (poolName && open) {
            socket.emit('joinPool', poolName);
            setUnread(false);
        }
    }, [poolName, open]);

    useEffect(() => {
        socket.on('chatMessage', (msg) => {
            dispatch(addMessage(msg));
            if (!open && msg.username !== username) {
                setUnread(true);
            }
        });

        return () => {
            socket.off('chatMessage');
        };
    }, [open, username, dispatch]);

    const toggleDrawer = () => {
        setOpen((prevOpen) => !prevOpen);
        dispatch(updateLastReadTimestamp(username));
    };

    const handleSendMessage = () => {
        if (message.trim() && username) {
            const msg = { username, message, poolName };
            socket.emit('chatMessage', msg);
            setMessage('');
        }
    };

    useEffect(() => {
        if (open && messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            }, 0);
        }
    }, [messages, open]);

    return (
        <Container sx={{ marginLeft: '-5px' }}>
            <Box
                className="chat--container--header"
                onClick={toggleDrawer}
                sx={{
                    position: 'fixed',
                    bottom: open ? '50vh' : '0px',
                    left: '20px',
                    zIndex: '1000',
                    width: isSmallScreen ? '160px' : '320px', // Adjust width based on screen size
                    cursor: 'pointer',
                    backgroundColor: 'green',
                    color: 'white',
                    height: '35px',
                    fontSize: '17px',
                    lineHeight: '30px',
                    padding: '10px 18px',
                    borderRadius: '4px',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                    transition: 'bottom 0.3s ease',
                }}
            >
                Pool Chat
                {unread && (
                    <span
                        className="unread-dot"
                        style={{
                            position: 'absolute',
                            top: '42%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            animation: 'blink 1s infinite alternate',
                        }}
                    />
                )}
            </Box>
            <Drawer
                anchor="bottom"
                open={open}
                onClose={toggleDrawer}
                sx={{
                    width: '320px',
                    transition: 'transform .95s ease',
                    transform: open ? 'translateY(0)' : 'translateY(100%)',
                    position: 'fixed',
                    bottom: '0px',
                    left: '20px',
                    zIndex: '999',
                    padding: '10px 18px',
                }}
                hideBackdrop={true}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '50vh' }}>
                    <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {messages.map((msg, index) => {
                            const isCurrentUser = msg.username === username;
                            return (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    {!isCurrentUser && (
                                        <ListItemAvatar>
                                            <Avatar src={profilePics[msg.username]} />
                                        </ListItemAvatar>
                                    )}
                                    <ListItemText
                                        primary={`${msg.username}: ${msg.message}`}
                                        sx={{
                                            textAlign: isCurrentUser ? 'right' : 'left',
                                            maxWidth: '75%',
                                            wordWrap: 'break-word',
                                            backgroundColor: isCurrentUser ? '#DCF8C6' : '#FFFFFF',
                                            padding: '8px',
                                            borderRadius: '10px',
                                            marginLeft: isCurrentUser ? '10px' : '0',
                                            marginRight: isCurrentUser ? '0' : '10px',
                                        }}
                                    />
                                    {isCurrentUser && (
                                        <ListItemAvatar>
                                            <Avatar src={profilePics[msg.username]} />
                                        </ListItemAvatar>
                                    )}
                                </ListItem>
                            );
                        })}
                        <div ref={messagesEndRef}/>
                    </List>
                    <Box sx={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
                        <TextField
                            label="Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            fullWidth
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={status === 'loading'}
                            sx={{ 
                                marginLeft: '10px', 
                                backgroundColor: '#222',
                                '&:hover': {
                                    backgroundColor: 'DarkGreen',
                                }
                            }}
                        >
                            Send
                        </Button>
                    </Box>
                    {status === 'loading' && <p>Loading...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </Box>
            </Drawer>
        </Container>
    );
}

export default Chat;
