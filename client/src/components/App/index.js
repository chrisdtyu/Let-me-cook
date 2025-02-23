//this has the main application
import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {BrowserRouter as Router, Route, Routes} from  'react-router-dom';
import Home from '../Home';
// import Review from '../Review';
import Search from '../Search';
import Login from '../Login';
import Profile from '../Profile';
import Recipe from '../Recipe';


const App = () => {

  return (
    <div>
        <Router>
          <Routes>
            <Route path = '/' element = {<Home />} />
            <Route path = '/Search' element = {<Search />} />
            <Route path = '/Recipe/:id' element = {<Recipe />} />
            {/* <Route path = '/Review' element = {<Review />} />  */}
            <Route path = '/Login' element = {<Login />} />
            <Route path = '/Profile' element = {<Profile />} />

          </Routes>
        </Router>
        <CssBaseline />
    </div>
  );
}

export default App;
