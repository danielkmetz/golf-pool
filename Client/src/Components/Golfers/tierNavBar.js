import React, {useState} from 'react';
import { Container, Button, Menu, MenuItem } from '@mui/material';

function TierNavBar() {
    const [anchor, setAnchor] = useState(null);
    const open = Boolean(anchor);
    
    const handleClick = (event) => {
        setAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchor(null)
    }

    return (
        <Container className="tier-navigation">
            <Button
                id="tier-button"
                aria-controls={open ? 'tier-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
            >
                Tiers
            </Button>
            <Menu
                id="tier-menu"
                anchor={anchor}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'tier-button'
                }}
            >
                <MenuItem onClick={handleClose}>Tier 1 Golfers</MenuItem>
                <MenuItem onClick={handleClose}>Tier 2 Golfers</MenuItem>
                <MenuItem onClick={handleClose}>Tier 3 Golfers</MenuItem>
                <MenuItem onClick={handleClose}>Tier 4 Golfers</MenuItem>
            </Menu>
        </Container>
    )
};

export default TierNavBar;