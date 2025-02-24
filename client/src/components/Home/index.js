import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const Home = () => {
    const navigate = useNavigate();
    return(
        <>
            <LetmecookAppBar page = "Home"/>
            <Box
                sx={{
                    maxWidth: '100%',
                    margin: '0px',
                    padding: '2rem',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundColor: '#fffbf0'
                }}
            >
                <Typography variant="h2" fontWeight="bold" color="text.primary">
                    Let Me Cook! 🔥
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: "800px" }}>
                    Welcome to <strong>Let Me Cook</strong>, the student-friendly meal helper! 🍕🥗🍔
                    Enter what you have in your kitchen, and we'll show you delicious, easy-to-make recipes
                    that fit your budget, food preferences, time constraints, and more! 🥑🍗
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 4, px: 4, py: 2, fontSize: "1rem", borderRadius: "8px" }}
                    onClick={() => navigate('/Search')}
                >
                    Get Cooking!
                </Button>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 2 }}>
                    No fancy ingredients needed—just what you've got in your pantry! 🥕🧄🍞
                </Typography>
            </Box>
        </>
    )
}

export default Home;