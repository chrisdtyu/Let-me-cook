import React from 'react';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';
import Box from '@mui/material/Box';
import Api from './Api';
import { useNavigate } from 'react-router-dom';

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const Search = () => {
    const navigate = useNavigate();

    const [recipes, setRecipes] = React.useState([]);

    const getRecipes = async () => {
        try {
            // get recipe information
            const recipes = await Api.callApiGetRecipes();
            setRecipes(recipes);
        } catch (error) {
            console.error("Error fetching recipe:", error);
        }
    };

    React.useEffect(() => {
        getRecipes();
    }, []); 

    return(
        <>
            <LetmecookAppBar page = "Search"/>
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
                <ul>
                {recipes.map((recipe) => (
                    <li key={recipe.recipe_id}>                    
                        <Link onClick={() => navigate('/Recipe/'+recipe.recipe_id)}>{recipe.name} {recipe.prep_time}</Link>                    
                    </li>
                ))}
                </ul>                
                
            </Box>
        </>
    )
}

export default Search;