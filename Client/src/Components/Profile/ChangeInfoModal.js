import React from 'react';
import { Box, Modal, Typography, TextField, Button, useMediaQuery, useTheme } from '@mui/material';

function ChangeInfoModal({ open, onClose, newUsername, handleChangeUsername, handleSubmitUsername }) {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                width: isSmallScreen ? 270 : 400, 
                maxWidth: '100%', 
            }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Change Username
                </Typography>
                <TextField
                    label="New Username"
                    variant="outlined"
                    fullWidth
                    value={newUsername}
                    onChange={handleChangeUsername}
                    sx={{ mt: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={onClose} color="secondary" sx={{ mr: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitUsername} variant="contained" color="primary"
                        sx={{
                            backgroundColor: '#222',
                            '&:hover': {
                                backgroundColor: 'DarkGreen',
                            }
                        }}
                    >
                        Submit
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default ChangeInfoModal;
