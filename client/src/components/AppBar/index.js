import React from 'react';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

const LetmecookAppBar = ({ page }) => {
    const navigate = useNavigate();

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: "#3e0907"
            }}
        >
            <Toolbar>
                <IconButton
                    size="small"
                    edge="start"
                    color="#3b3b3b"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <b>{page}</b>
                </Typography>
                <Button
                    color="inherit"
                    onClick={() => navigate('/')}
                    id="nav-home"
                    sx={{
                        '&:hover': {
                            backgroundColor: '#851f23',
                            color: '#FFFFFF',
                        },
                        backgroundColor: page === 'Home' && '#851f23',
                        color: '#FFFFFF'
                    }} >
                    <b>Home</b>
                </Button>
                <Button
                    color="inherit"
                    onClick={() => navigate('/Search')}
                    id="nav-search"
                    sx={{
                        '&:hover': {
                            backgroundColor: '#851f23',
                            color: '#FFFFFF',
                        },
                        backgroundColor: page === 'Search' && '#851f23',
                        color: '#FFFFFF'
                    }} >
                    <b>Search</b>
                </Button>
                <Button
                    color="inherit"
                    onClick={() => navigate('/Profile')}
                    id="nav-Profile"
                    sx={{
                        '&:hover': {
                            backgroundColor: '#851f23',
                            color: '#FFFFFF',
                        },
                        backgroundColor: page === 'Profile' && '#851f23',
                        color: '#FFFFFF'
                    }} >
                    <b>Profile</b>
                </Button>
                <Button
                    color="inherit"
                    onClick={() => navigate('/Login')}
                    id="nav-login"
                    sx={{
                        '&:hover': {
                            backgroundColor: '#851f23',
                            color: '#FFFFFF',
                        },
                        backgroundColor: page === 'Login' && '#851f23',
                        color: '#FFFFFF'
                    }} >
                    <b>Login</b>
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default LetmecookAppBar;