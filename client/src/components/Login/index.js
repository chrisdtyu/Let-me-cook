import React, { useState } from 'react';
import firebase from '../Firebase/firebase';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';  
import { useNavigate } from 'react-router-dom';

const FormContainer = styled(Box)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    maxWidth: 400,
    width: '100%',
}));

const ChangeField = styled(Typography)(({ theme }) => ({
    textDecoration: 'underline',
    cursor: 'pointer',
    color: 'black',
    '&:hover': {
        color: 'blue',
    },
    marginTop: theme.spacing(2),
}));

const Login = () => {

    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [personalName, setPersonalName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            await handleLogin();
        } else {
            await handleSignUp();
        }
    };

    const handleSignUp = async () => {
        const passwordReq = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
    
        if (!passwordReq.test(password)) {
            setErrorMessage('Password must be at least 12 characters long and contain at least one special character.');
            return;
        }
    
        try {
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebase_uid = userCredential.user.uid; // Get Firebase UID
    
            console.log('User signed up successfully:', firebase_uid);
    
            // Save to MySQL
            await fetch('/api/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firebase_uid, personalName, email, password }),
            });
    
            setPersonalName('');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error signing up: ', error.message);
            setErrorMessage(error.message);
        }
    };
    
    
    const handleLogin = async () => {
        try {
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebase_uid = userCredential.user.uid; // Get Firebase UID
    
            console.log('User logged in successfully:', firebase_uid);
    
            // Fetch user details from MySQL using Firebase UID
            const response = await fetch('/api/getUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firebase_uid }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
    
            const userData = await response.json();
            console.log('User details:', userData);
    
            navigate('/Profile');
    
            setPersonalName('');
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error logging in: ', error.message);
            setErrorMessage('Invalid email or password');
        }
    };
    

    return (
        <>
            <LetmecookAppBar page={isLogin ? "Login" : "Sign Up"} />
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
                    justifyContent: 'center',
                    alignItems: 'top',
                    textAlign: 'center',
                }}
            >
                <FormContainer>
                    <Typography variant="h4" gutterBottom>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Personal Name"
                                value={personalName}
                                onChange={(e) => setPersonalName(e.target.value)}
                                required
                            />
                        )}
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {errorMessage && (
                            <Typography color="error" variant="body2">
                                {errorMessage}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                        >
                            {isLogin ? 'Login' : 'Sign Up'}
                        </Button>
                    </form>
                    <ChangeField onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign Up here" : "Already have an account? Login here"}
                    </ChangeField>
                </FormContainer>
            </Box>
        </>
    );
};

export default Login;