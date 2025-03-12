import React from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Api from './Api';
import LetmecookAppBar from '../AppBar';
import ReviewList from '../ReviewList'

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const RecipeView = ({getRecipe, recipe, ingredients}) => {

    //id is defined by the recipe that is pressed on from the search page
    const { id } = useParams();

    React.useEffect(() => {
        getRecipe(id);
    }, [id, getRecipe]);

    return(
        <>
        <LetmecookAppBar page={`Recipe: ${recipe ? recipe.name : ""}`} />
        <MainGridContainer container direction="column" alignItems="center">
        <Typography variant="h4"><b>{recipe.name}</b></Typography>
        {recipe.image && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <img src={recipe.image} alt="Recipe" style={{ width: '50%', borderRadius: 8 }} />
            </Box>
        )}
        <Typography variant="h6">Category: {recipe.category} | Type: {recipe.type}</Typography>
        <Typography variant="h6">Time: {recipe.prep_time} mins</Typography>

        <Typography variant="h5" sx={{ mt: 2 }}><b>Ingredients:</b></Typography>
        <Typography variant="h10" sx={{ mt: 2 }}>required = *</Typography>
        <ul>
          {ingredients.map((ing) => (
            <li key={ing.ingredient_id}>
              {ing.quantity} {ing.quantity_type} {ing.name}
            </li>
          ))}
        </ul>

        <Typography variant="h5" sx={{ mt: 2 }}><b>Instructions:</b></Typography>
        <ul>
          {recipe.instructions ? recipe.instructions.split('.').map((step, index) => (
            <li key={index}>{step.trim()}</li>
          )): ""}
        </ul>

        {recipe.video && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6"><b>Video:</b></Typography>
            <iframe width="560" height="315" src={recipe.video} title="Recipe Video" allowFullScreen></iframe>
          </Box>
        )}
      <ReviewList recipeId={id}> </ReviewList>
      </MainGridContainer>
    </>
    )
}


export default RecipeView;
  