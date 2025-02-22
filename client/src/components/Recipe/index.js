import React from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Api from './Api';
import LetmecookAppBar from '../AppBar';

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const RecipeView = () => {

    const [recipe, setRecipe] = React.useState({});
    const [ingredients, setIngredients] = React.useState([]);

    //id is defined by the recipe that is pressed on from the search page
    const { id } = useParams();

    // const handleRecipe = (recipeId) => {
    //     callApiGetRecipe(recipeId)
    //     .then(res => {
    //         setIngredients(res);
    //     })
    //     .catch(err => {
    //         console.error("Error fetching ingredients:", err);
    //     });
    // };

    // const handleFetchIngredients = (recipeId) => {
    //     callApiGetRecipeIngredients(recipeId)
    //     .then(res => {
    //         setIngredients(res);
    //     })
    //     .catch(err => {
    //         console.error("Error fetching ingredients:", err);
    //     });
    // };

    const getRecipe = async (recipe_id) => {
        try {
            // get recipe information
            const recipe = await Api.callApiGetRecipe(recipe_id);
            setRecipe(recipe);
            // get recipe ingredients
            const ingredients = await Api.callApiGetRecipeIngredients(recipe_id);
            setIngredients(ingredients);
        } catch (error) {
            console.error("Error fetching recipe:", error);
        }
    };

    React.useEffect(() => {
        getRecipe(id);
    }, [id]); 

    // const callApiRecipe = async (searchedMovie, searchedActor, searchedDirector) => {
    //     try{
    //         const response = await fetch("/api/Recipe", {
    //             method: "POST",
    //             headers: {
    //             "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 searchedMovie: searchedMovie,
    //                 searchedActor: searchedActor,
    //                 searchedDirector: searchedDirector
    //             }
    //             )
    //         });
    //         const body = await response.json();
    //         if (response.status !== 200) throw Error(body.message);
    //         return body;
    //         }
    //     catch(err){
    //         console.log("error:", err)
    //     }
    // }

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
      </MainGridContainer>
    </>
    )
}


export default RecipeView;
  