import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';
import Box from '@mui/material/Box';

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = () => {
        if (password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long.');
        } else {
            setErrorMessage('');
            // save the password, create an API 
        }
    };

    return(
        <>
            <LetmecookAppBar page = "Login"/>
            <Box
                sx={{
                    maxWidth: '100%',
                    margin: '0px',
                    padding: '2rem',
                    backgroundImage: `url('/theatre-background.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    height: '100vh',        
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'top',
                    textAlign: 'center'
                }}
            >
                Login Page
            </Box>
        </>
    )
}

export default Login;