import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { withdrawBalance, selectUserBalance, getAccountBalance } from '../../Features/balanceSlice';
import { sendPayment, } from '../../Features/balanceSlice';

function AccountBalance({ username, email, onClose }) {
    const dispatch = useDispatch();
    const userBalance = useSelector(selectUserBalance);
    const balance = userBalance?.balance
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [otherEmail, setOtherEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        dispatch(getAccountBalance({username, email }))
    }, [dispatch, success])

    const handleWithdrawAmountChange = (event) => {
        const value = event.target.value;
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
            setWithdrawAmount(value);
        }
    };

    const handleEmailChange = (event) => {
        setOtherEmail(event.target.value);
    };

    const sendPaymentFunction = async () => {
        try {
            const result = await dispatch(sendPayment({
                username, email: otherEmail, payout: withdrawAmount}));
            console.log(result.message);
        } catch (err) {
            console.error('Error sending payment:', err)
        }
    };

    const handleWithdraw = async () => {
        if (parseFloat(withdrawAmount) <= balance && email) {
            try {
                const result = await dispatch(withdrawBalance({ 
                    username, email, adjustment: -parseFloat(withdrawAmount) })).unwrap();
                console.log(result);
                console.log('Result from dispatch:', result.balance); // Log result from dispatch
    
                if (result.message === 'Balance updated successfully') {
                    setSuccess('Withdrawal successful.');
                    sendPaymentFunction();
                    setError('');
                    onClose();
                } else {
                    setError('Failed to update balance.');
                    setSuccess('');
                }
            } catch (err) {
                console.error('Error during withdraw:', err); // Log error
                setError('Failed to update balance.');
                setSuccess('');
            }
        } else if (!email) {
            setError('Please enter an email address.');
            setSuccess('');
        } else if (parseFloat(withdrawAmount) > balance) {
            setError('Withdrawal amount cannot exceed balance.');
            setSuccess('');
        }
    };
    console.log(balance);
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontFamily: 'Rock Salt' }}>Account Balance</Typography>
            <Box
                sx={{
                    marginTop: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: '25px'
                }}
            >
                ${balance}
            </Box>
            <Box 
                sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <TextField
                    label="Withdraw Amount"
                    variant="outlined"
                    value={withdrawAmount}
                    onChange={handleWithdrawAmountChange}
                    sx={{ mt: 2, mb: 2 }}
                    error={parseFloat(withdrawAmount) > balance}
                    helperText={parseFloat(withdrawAmount) > balance ? 'Amount exceeds balance' : ''}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        label="Email"
                        variant="outlined"
                        value={otherEmail}
                        onChange={handleEmailChange}
                        sx={{ mb: 1 }}
                        error={!email && error !== ''}
                        helperText={!email && error !== '' ? 'Please enter an email address' : ''}
                    />
                    <Typography
                        sx={{
                            maxWidth: '150px',
                            fontSize: '12px',
                            marginBottom: 2,
                            textAlign: 'center',
                        }}
                    >
                        This is the email we will send your eCheck to
                    </Typography>
                </Box>
                <Button
                    onClick={handleWithdraw}
                    sx={{
                        backgroundColor: 'green',
                        color: 'black',
                        fontWeight: 'bold',
                        border: '1px solid black',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: '5px 10px',
                        ':hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        ':focus': {
                            outline: 'none',
                        },
                    }}
                >
                    Withdraw
                </Button>
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default AccountBalance;
