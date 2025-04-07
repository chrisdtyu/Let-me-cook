import React from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { Home as HomeIcon, Search as SearchIcon, AccountCircle, RestaurantMenu, Login as LoginIcon } from '@mui/icons-material';

const LetmecookAppBar = ({ page }) => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" sx={{ backgroundColor: "#8C3F39" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <b>{page}</b>
        </Typography>
        <Button color="inherit" onClick={() => navigate('/')} id="nav-home" sx={{ '&:hover': { backgroundColor: '#732F2A ' }, backgroundColor: page === 'Home' && '#A24F46', display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 1 }} /> Home
        </Button>
        <Button color="inherit" onClick={() => navigate('/search')} id="nav-search" sx={{ '&:hover': { backgroundColor: '#732F2A ' }, backgroundColor: page === 'Search' && '#A24F46', display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ mr: 1 }} /> Search
        </Button>
        <Button color="inherit" onClick={() => navigate('/profile')} id="nav-profile" sx={{ '&:hover': { backgroundColor: '#732F2A ' }, backgroundColor: page === 'Profile' && '#A24F46', display: 'flex', alignItems: 'center' }}>
          <AccountCircle sx={{ mr: 1 }} /> Profile
        </Button>
        <Button color="inherit" onClick={() => navigate('/my-recipes')} id="nav-my-recipes" sx={{ '&:hover': { backgroundColor: '#732F2A ' }, backgroundColor: page === 'My Recipes' && '#A24F46', display: 'flex', alignItems: 'center' }}>
          <RestaurantMenu sx={{ mr: 1 }} /> My Recipes
        </Button>
        <Button color="inherit" onClick={() => navigate('/login')} id="nav-login" sx={{ '&:hover': { backgroundColor: '#732F2A ' }, backgroundColor: page === 'Login' && '#A24F46', display: 'flex', alignItems: 'center' }}>
          <LoginIcon sx={{ mr: 1 }} /> Login
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default LetmecookAppBar;
