import React from 'react';
import { Box, Typography, Tabs, Tab, Link } from '@mui/material';

function Header() {
    return (
        <Box className="header" 
            sx={{
                display: "flex",
                backgroundColor: "green", 
                justifyContent: "space-between",
                alignItems: "center",
                height: { xs: 100, md: 100 },
                paddingX: { xs: 2, md: 4 },
                paddingTop: { xs: 2, md: 1 }, // Increased top padding on phones
                paddingBottom: { xs: 2, md: 1 }, // Increased bottom padding on phones
                overflow: "hidden",
                flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens, inline on larger screens
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center"}}>
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: "Rock Salt",
                        color: "black",
                        marginBottom: { xs: 1, md: 0 }, // Add margin only on small screens
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                    }}
                >
                The Golf Pool
                </Typography>
                <img src={require("./no-background-logo.png")} 
                    style={{height: '70px', marginLeft: { xs: '5px', md: '10px' }}}/>
            </Box>
            <Box className="navigation" 
                sx={{
                    display: "flex", 
                    alignItems: "center",
                    flexDirection: { xs: 'row', md: 'row' }, 
                    gap: 2, 
                    marginLeft: { xs: 0, md: 2 },
                }}
            >
                <Tabs value={false} sx={{ '& .MuiTabs-flexContainer': { flexDirection: { xs: 'row', md: 'row' } } }}>
                    <Link href="/" sx={{color: "black"}}>
                        <Tab label="Home+Rules" sx={{ fontSize: { xs: 12, md: 16 } }}/>
                    </Link>
                    <Link href="/News" sx={{color: "black"}}>
                        <Tab label="News" sx={{ fontSize: { xs: 12, md: 16 } }}/>
                    </Link>
                    <Link href="/Golfers" sx={{color: "black"}}>
                        <Tab label="Golfers" sx={{ fontSize: { xs: 12, md: 16 } }}/>
                    </Link>
                    <Link href="/Profile" sx={{color: "black"}}>
                        <Tab label="Profile" sx={{ fontSize: { xs: 12, md: 16 } }}/>
                    </Link>
                </Tabs>
            </Box>
        </Box>
    )
};

export default Header;

