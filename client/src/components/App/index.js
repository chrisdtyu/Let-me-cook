import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../Home';
import Search from '../Search';
import Login from '../Login';
import Profile from '../Profile';
import Recipe from '../Recipe';
import MyRecipes from '../Recipe/MyRecipes';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#A24F46' },
    background: {
      default: '#fffbf0',
    },
  },
  typography: {
    fontFamily: `Helvetica`,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          padding: '12px 32px',
          textTransform: 'none',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/recipe/:id" element={<Recipe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
