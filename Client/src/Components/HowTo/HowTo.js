import React from 'react';
import { Box, Typography } from '@mui/material';
import Video from './Video';
import {selectUserPoolData} from '../../Features/poolsSlice';
import { useSelector } from 'react-redux';

function HowTo() {
    const videoUrl = process.env.REACT_APP_TUTORIAL_URL;
    const poolInfo = useSelector(selectUserPoolData);
    const format = poolInfo.format;

    return (
        <>
        {format === "Single Week" || format === "Multi-Week" ? 
        (<Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '3rem',
            }}
        >
            <Box sx={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Welcome to The Golf Pool!
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    Pick 8 golfers and go head-to-head against other users
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    Follow their scores live, and see who reigns supreme after 4 days of PGA tournament action
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'gray' }}>
                    Watch the video below for a quick tutorial
                </Typography>
            </Box>
            <Box>
                <Video videoUrl={videoUrl} />
            </Box>
        </Box>) :
        (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '3rem',
            }}
        >
            <Box sx={{ textAlign: 'center', marginBottom: '2rem' }}>
                <Typography sx={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Welcome to The Golf Pool!
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    Use your credits to assemble your roster of golfers
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    Follow their scores live, and see who reigns supreme after 4 days of PGA tournament action
                </Typography>
                <Typography sx={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'gray' }}>
                    Watch the video below for a quick tutorial
                </Typography>
            </Box>
            <Box>
                <Video videoUrl={videoUrl} />
            </Box>
        </Box>
        )}
        </>
    );
}

export default HowTo;
