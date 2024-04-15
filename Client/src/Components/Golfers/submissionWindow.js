import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router';

function SubmissionWindow({isOpen, handleClose, title, children, handleSubmission}) {

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button onClick={handleSubmission}>Close</Button>
            </DialogActions>
        </Dialog>
    )
};

export default SubmissionWindow;

