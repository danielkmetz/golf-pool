import React from 'react';
import { Box, Typography, Tabs, Tab, Link } from '@mui/material';

function Header() {
    return (
        <Box className="header" 
            sx={{
                display: "flex",
                backgroundColor: "green", 
                justifyContent: "space-between"
                }}
        >
            <Typography
                variant="h3"
                sx={{
                    marginLeft: "2rem",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    fontFamily: "Rock Salt"
                }}
            >
               The Golf Pool
            </Typography>
            <Box className="navigation" 
                sx={{
                    display: "flex", 
                    alignItems: "center",
                    marginRight: "1rem", 
                    }}
            >
                <Tabs value={false}>
                    <Link href="/" sx={{color: "black"}}>
                        <Tab label="Home+Rules" />
                    </Link>
                    <Link href="/Golfers" sx={{color: "black"}}>
                        <Tab label="Golfers" />
                    </Link>
                    <Link href="/Profile" sx={{color: "black"}}>
                        <Tab label="Profile" />
                    </Link>
                </Tabs>
            </Box>
        </Box>
    )
};

export default Header;