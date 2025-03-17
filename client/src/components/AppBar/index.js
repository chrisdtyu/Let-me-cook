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
      sx={{ backgroundColor: "#3e0907" }}
    >
      <Toolbar>
        <IconButton size="small" edge="start" sx={{ mr: 2 }}>
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <b>{page}</b>
        </Typography>
        <Button
          color="inherit"
          onClick={() => navigate('/')}
          id="nav-home"
          sx={{
            '&:hover': { backgroundColor: '#851f23' },
            backgroundColor: page === 'Home' && '#851f23',
            color: '#FFFFFF'
          }}
        >
          <b>Home</b>
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate('/search')}
          id="nav-search"
          sx={{
            '&:hover': { backgroundColor: '#851f23' },
            backgroundColor: page === 'Search' && '#851f23',
            color: '#FFFFFF'
          }}
        >
          <b>Search</b>
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate('/profile')}
          id="nav-profile"
          sx={{
            '&:hover': { backgroundColor: '#851f23' },
            backgroundColor: page === 'Profile' && '#851f23',
            color: '#FFFFFF'
          }}
        >
          <b>Profile</b>
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate('/my-recipes')}
          id="nav-my-recipes"
          sx={{
            '&:hover': { backgroundColor: '#851f23' },
            backgroundColor: page === 'My Recipes' && '#851f23',
            color: '#FFFFFF'
          }}
        >
          <b>My Recipes</b>
        </Button>
        <Button
          color="inherit"
          onClick={() => navigate('/login')}
          id="nav-login"
          sx={{
            '&:hover': { backgroundColor: '#851f23' },
            backgroundColor: page === 'Login' && '#851f23',
            color: '#FFFFFF'
          }}
        >
          <b>Login</b>
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default LetmecookAppBar;
