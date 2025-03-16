import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Api from './Api';
import LetmecookAppBar from '../AppBar';
import ReviewList from '../ReviewList'

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const RecipeView = ({getRecipe, recipe, ingredients, budgetMode}) => {
    //id is defined by the recipe that is pressed on from the search page
    
    const { id } = useParams();
    const [scaleFactor, setScaleFactor] = useState(1);
    const [baseQuantity, setBaseQuantity] = useState({});
    const [baseIngredientId, setBaseIngredientId] = useState(null);
    const [sliderValue, setSliderValue] = useState(1);
    const [sliderMin, setSliderMin] = useState(1);
    const [sliderMax, setSliderMax] = useState(5);

    useEffect(() => {
        getRecipe(id);
    }, [id, getRecipe]);
    
    useEffect(() => {
      if (ingredients.length > 0) {
        console.log('Ingredients:', ingredients);
        const initialQuantities = {};
        ingredients.forEach(ing => {
          if (ing.required === 1) {
            initialQuantities[ing.ingredient_id] = ing.quantity;
          }
        });
        setBaseQuantity(initialQuantities);
      }
    }, [ingredients]);

    useEffect(() => {
      if (baseIngredientId && baseQuantity[baseIngredientId]) {
        const initialQuantity = baseQuantity[baseIngredientId];
        setSliderMin(Math.round(initialQuantity * 0.1));
        setSliderMax(Math.round(initialQuantity * 5));
        setSliderValue(initialQuantity);
        setScaleFactor(1);
      }
    }, [baseIngredientId, baseQuantity]);

    const handleScaleChange = (event, newValue) => {
      setSliderValue(newValue);
      setScaleFactor(newValue / (baseQuantity[baseIngredientId] || 1));
    };

    const handleBaseIngredientChange = (event) => {
      setBaseIngredientId(event.target.value);
      setScaleFactor(1);
    };

    const totalCost = budgetMode ? ingredients.reduce((sum, ing) => sum + (ing.price !== null && ing.price !== undefined ? ing.price : 0), 0) : null;

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

        <MainGridContainer container justifyContent="center" alignItems="flex-start" spacing={4}>
          <Grid item xs={5} sx={{ display: "flex", justifyContent: "right" }}>
            <Box sx={{ textAlign: "left" }}>
            <Typography variant="h5" sx={{ mt: 2, mb: 1}}><b>Ingredients:</b></Typography>
            <Typography variant="h10" sx={{ mb: 1 }}>required = *</Typography>

            <ul style={{ marginTop: '20px' }}>
              {ingredients.map((ing) => {

                  let displayQuantity = ing.quantity;
                  let isScaled = false;
                  if (ing.required === 1 && baseQuantity[ing.ingredient_id] && baseIngredientId) {
                    const baseScale = baseIngredientId === ing.ingredient_id ? sliderValue / baseQuantity[baseIngredientId] : scaleFactor;
                    displayQuantity = baseQuantity[ing.ingredient_id] * baseScale;
                    isScaled = true;
                  }

                  let formattedQuantity;
                  if (ing.quantity_type) {
                      formattedQuantity = Math.round(displayQuantity);
                  } else {
                      formattedQuantity = isScaled ? displayQuantity.toFixed(1) : Math.round(displayQuantity);
                  }

                  const ingredientPrice = (budgetMode && ing.price !== null && ing.price !== undefined && ing.price > 0)
                  ? ` - $${ing.price.toFixed(2)}`
                  : (budgetMode ? " - Price Not Available" : "");

                  return (
                      <li key={ing.ingredient_id} style={{ textAlign: "left" }}>
                        {formattedQuantity} {ing.quantity_type ? ing.quantity_type + " " : ""}{ing.name} {ing.required === 1 ? '*' : ''}
                        {ingredientPrice}
                      </li>
                  );
              })}
            </ul>
            </Box>
          </Grid>

          <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", alignItems: "left" }}>

          <FormControl sx={{ mt: 2, width: "80%", maxWidth: 300 }}>
            <InputLabel id="base-ingredient-label">Base Ingredient for Scaling</InputLabel>
            <Select
              labelId="base-ingredient-label"
              value={baseIngredientId || ''}
              onChange={handleBaseIngredientChange}
              renderValue={(selected) => {
                if (!selected) {
                  return <em>Select an ingredient</em>;
              }
                const selectedIngredient = ingredients.find((ing) => ing.ingredient_id === selected);
                return selectedIngredient ? selectedIngredient.name : "Select an ingredient";
              }}
            >
              {ingredients.filter(ing => ing.required === 1).map((ing) => (
                <MenuItem key={ing.ingredient_id} value={ing.ingredient_id}>{ing.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Scale Ingredients */}
          <Slider
              value={sliderValue}
              onChange={handleScaleChange}
              step={1} 
              marks
              min={sliderMin}
              max={sliderMax}  
              valueLabelDisplay="auto"
              sx={{ width: "80%", maxWidth: 300, mt: 2 }}
            />
          </Grid>
        </MainGridContainer>

        <Typography variant="h5" sx={{ mt: 2 }}><b>Instructions:</b></Typography>
        <ul>
          {recipe.instructions ? recipe.instructions.split('.').map((step, index) => (
            <li key={index}>{step.trim()}</li>
          )): ""}
        </ul>

        {budgetMode && (
          <Typography variant="h6">
            Total Estimated Cost: ${totalCost.toFixed(2)}
          </Typography>
        )}


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
