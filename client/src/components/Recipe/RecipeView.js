import React, { useState, useEffect } from 'react';
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
import Button from '@mui/material/Button';
import Api from './Api';
import LetmecookAppBar from '../AppBar';
import ReviewList from '../ReviewList/ReviewList';
import Review from '../ReviewForm';
import Note from '../Notes/Notes';
import PriceDisplay from '../Budget/PriceDisplay';
import { useBudget } from '../Budget/BudgetContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
  },
}));

const RecipeView = ({ getRecipe, recipe, ingredients }) => {
  const { id } = useParams();
  const [scaleFactor, setScaleFactor] = useState(1);
  const [baseQuantity, setBaseQuantity] = useState({});
  const [baseIngredientId, setBaseIngredientId] = useState(null);
  const [sliderValue, setSliderValue] = useState(1);
  const [sliderMin, setSliderMin] = useState(1);
  const [sliderMax, setSliderMax] = useState(5);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { budgetMode, weeklySpent, addedRecipes, addMealCost } = useBudget();
  const [noteSubmittedFlag, setNoteSubmittedFlag] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    getRecipe(id);
  }, [id, getRecipe]);

  useEffect(() => {
    if (id) {
      getReviews(id);
    }
  }, [id]);

  const getReviews = React.useCallback(async (recipe_id) => {
    try {
      const response = await Api.callApiGetReviews(recipe_id);
      const reviews = response.reviews || [];
      setReviews(reviews);
      setAverageRating(response.average_rating);
    } catch (error) {
      console.error("Error fetching review:", error);
    }
  }, []);

  useEffect(() => {
    if (ingredients.length > 0) {
      const initialQuantities = {};
      ingredients.forEach((ing) => {
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

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserData(storedUserId);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const firebaseUid = localStorage.getItem('firebase_uid');
      const response = await fetch('/api/getUserProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebase_uid: firebaseUid }),
      });
      const data = await response.json();
      setUserData(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleScaleChange = (event, newValue) => {
    setSliderValue(newValue);
    setScaleFactor(newValue / (baseQuantity[baseIngredientId] || 1));
  };

  const handleBaseIngredientChange = (event) => {
    setBaseIngredientId(event.target.value);
    setScaleFactor(1);
  };

  const handleReviewSubmitted = (newReview) => {
    // First, update the reviews state
    setReviews((prevReviews) => [...prevReviews, newReview]);
  
    // Return a Promise that resolves once the state has been updated
    return new Promise((resolve, reject) => {
      // Use setTimeout to wait for the state to be updated before calling getReviews
      setTimeout(() => {
        getReviews(id)  // Call getReviews after state update
          .then(() => resolve())  // Resolve once getReviews is completed
          .catch((error) => reject(error));  // Reject if there's an error
      }, 0);
    });
  };

  const handleNoteSubmitted = () => {
    setNoteSubmittedFlag(true);
    console.log('Note was successfully submitted');
    setTimeout(() => {
      setNoteSubmittedFlag(false);
    }, 2000);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <LetmecookAppBar page={`Recipe: ${recipe ? recipe.name : ''}`} />
      <MainGridContainer container direction="column" alignItems="center">
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          <b>{recipe.name}</b>
        </Typography>

        <Grid container spacing={2} alignItems="flex-start" justifyContent="center">
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ImageContainer>
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt="Recipe"
                  style={{ width: '100%', maxWidth: '400px', borderRadius: 8 }}
                />
              )}
            </ImageContainer>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Note recipeId={id} noteSubmitted={handleNoteSubmitted} />
          </Grid>
        </Grid>

        <Typography variant="h6">
          Category: {recipe.category} | Type: {recipe.type} 
        </Typography>
        <Typography variant="h6">Target Goal: {recipe.goals || "N/A"}</Typography>
        <Typography variant="h6">Time: {recipe.prep_time} mins</Typography>

        {budgetMode && (
          <>
            <Typography variant="h6">
              Estimated Total Cost: {recipe.estimated_cost ? `$${recipe.estimated_cost.toFixed(2)}` : 'N/A'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => {
                if (recipe.estimated_cost) {
                  addMealCost(recipe.recipe_id, recipe.estimated_cost);
                  setSnackbarOpen(true);
                }
              }}
            >
              Add to This Week's Meals
            </Button>
          </>
        )}

        <Typography variant="h5" sx={{ mt: 2 }}><b>Ingredients:</b></Typography>
        <Typography variant="h10" sx={{ mt: 2 }}>required = *</Typography>

        <Box sx={{ marginTop: '40px' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              borderBottom: '2px solid #000',
              paddingBottom: '0.5rem',
            }}
          >
            <Box sx={{ width: '50%' }}>
              <Typography variant="body1">Ingredient</Typography>
            </Box>
            <Box sx={{ width: '50%', textAlign: 'right' }}>
              <Typography variant="body1">Substitutes</Typography>
            </Box>
          </Box>
          {/* Ingredient list */}
          {recipe.ingredients?.map((ing) => {
            let displayQuantity = ing.quantity;
            if (ing.required === 1 && baseQuantity[ing.ingredient_id] && baseIngredientId) {
              const baseScale =
                baseIngredientId === ing.ingredient_id
                  ? sliderValue / baseQuantity[ing.ingredient_id]
                  : scaleFactor;
              displayQuantity = baseQuantity[ing.ingredient_id] * baseScale;
            }
            const formattedQuantity = ing.quantity_type
              ? displayQuantity.toFixed(1)
              : Math.round(displayQuantity);

            const subList =
              ing.substitutes && ing.substitutes.length > 0
                ? ing.substitutes.map((sub) => sub.name).join(', ')
                : '(No known substitutes)';

            return (
              <Box
                key={ing.ingredient_id}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '0.5rem',
                }}
              >
                {/* Left Column: Ingredient */}
                <Box sx={{ width: '50%' }}>
                  <Typography variant="body1">
                    {formattedQuantity}{' '}
                    {ing.quantity_type ? `${ing.quantity_type} ` : ''}
                    {ing.name} {ing.required === 1 ? '*' : ''}
                  </Typography>
                  <PriceDisplay
                    price={ing.price}
                    ingredientId={ing.ingredient_id}
                    alwaysAvailable={userData?.alwaysAvailable?.map(
                      (item) => item.ingredient_id
                    )}
                  />
                </Box>

                {/* Right Column: Substitutes */}
                <Box sx={{ width: '50%', textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    {subList}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Ingredient Scaling */}
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
              if (!selected) return <em>Select an ingredient</em>;
              const selectedIngredient = ingredients.find((ing) => ing.ingredient_id === selected);
              return selectedIngredient ? selectedIngredient.name : 'Select an ingredient';
            }}
          >
            {ingredients
              .filter((ing) => ing.required === 1)
              .map((ing) => (
                <MenuItem key={ing.ingredient_id} value={ing.ingredient_id}>
                  {ing.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <Typography variant="h5" sx={{ mt: 2 }}><b>Instructions:</b></Typography>
        <ul>
          {recipe.instructions
            ? recipe.instructions.split('.').map((step, index) => <li key={index}>{step.trim()}</li>)
            : ''}
        </ul>

        {recipe.video && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6"><b>Video:</b></Typography>
            <iframe
              width="560"
              height="315"
              src={recipe.video}
              title="Recipe Video"
              allowFullScreen
            />
          </Box>
        )}

        {userData && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6"><b>User Information:</b></Typography>
            <Typography variant="body1">Name: {userData.name}</Typography>
            <Typography variant="body1">Email: {userData.email}</Typography>
          </Box>
        )}

        {userId && (
          <Review
            recipeId={id}
            reviewSubmitted={handleReviewSubmitted}
            userId={userId}
          />
        )}

        <ReviewList recipeId={id} reviews={reviews} averageRating={averageRating} getReviews={getReviews} />
      </MainGridContainer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Meal added to your weekly budget tracker!
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default RecipeView;
