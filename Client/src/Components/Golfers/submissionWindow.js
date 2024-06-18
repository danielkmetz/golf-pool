import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

function SubmissionWindow({isOpen, handleClose, title, children}) {
    return (
        <Dialog open={isOpen}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button 
                    variant='conatained' 
                    onClick={handleClose}
                    sx={{
                        backgroundColor: 'DarkGreen',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'green',
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
};

export default SubmissionWindow;

