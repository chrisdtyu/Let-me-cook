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

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
  }));

const RecipeView = ({getRecipe, recipe, ingredients}) => {
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

        <ul style={{ marginTop: '40px' }}>
          {ingredients.map((ing) => {
              let displayQuantity = ing.quantity;
              let isScaled = false;
              if (ing.required === 1 && baseQuantity[ing.ingredient_id] && baseIngredientId) {
                const baseScale = baseIngredientId === ing.ingredient_id ? sliderValue / baseQuantity[baseIngredientId] : scaleFactor;
                displayQuantity = baseQuantity[ing.ingredient_id] * baseScale;
                isScaled = true;
              }

              let formattedQuantity;
                if (ing.quantity_type === null || ing.quantity_type === "") {
                    formattedQuantity = isScaled ? Math.round(displayQuantity) : Math.round(displayQuantity);
                } else {
                    formattedQuantity = isScaled ? displayQuantity.toFixed(1) : Math.round(displayQuantity);
                }

              return (
                  <li key={ing.ingredient_id}>
                    {formattedQuantity} {ing.quantity_type ? ing.quantity_type + " " : ""}{ing.name} {ing.required === 1 ? '*' : ''}
                  </li>
              );
          })}
        </ul>

        <Box sx={{ mt: 2, width: 300 }}>
          <Typography variant="h6"><b>Scale Ingredients:</b></Typography>
          <Slider
            value={sliderValue}
            onChange={handleScaleChange}
            step={1} 
            marks
            min={sliderMin}
            max={sliderMax}  
            valueLabelDisplay="auto"
          />
        </Box>

        <FormControl sx={{ mt: 2, mb: 2, width: 400 }}>
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
