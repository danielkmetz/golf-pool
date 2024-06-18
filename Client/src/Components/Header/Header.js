import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { selectPoolName } from '../../Features/poolsSlice';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Header({isLoggedIn}) {
    const poolName = useSelector(selectPoolName);

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
                <Tabs
                    value={false}
                    sx={{
                        '& .MuiTabs-flexContainer': {
                            flexDirection: 'row',
                        },
                        '& .MuiTab-root': {
                            fontSize: { xs: 10, md: 16 },
                            minWidth: { xs: 'auto', md: 100 },
                            padding: { xs: '6px 8px', md: '12px 16px' },
                            color: "black",
                        },
                    }}
                >
                    {!isLoggedIn || poolName === null ? (
                    <>
                        <Tab label="Welcome" component={Link} to="/" />
                        <Tab label="Create Pool" component={Link} to="/Create-Pool"/>
                        <Tab label="Join Pool" component={Link} to="/Join-Pool"/>
                        {!isLoggedIn && <Tab label="Login" component={Link} to="/Login"/>}
                    </>
                    ) : (
                    <>
                        <Tab label="How To" component={Link} to="/how-to"/>
                        <Tab label="Standings" component={Link} to="/Standings"/>
                        <Tab label="News" component={Link} to="/News"/>
                        <Tab label="Golfers" component={Link} to="/Golfers"/>
                        <Tab label="Profile" component={Link} to="/Profile"/>
                    </>
                    )}
                </Tabs>
            </Box>
        </Box>
    )
};

export default Header;
