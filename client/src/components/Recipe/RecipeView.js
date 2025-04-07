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
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


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
  const { budgetMode, weeklySpent, addedRecipes, addMealCost, toggleBudgetMode } = useBudget();
  const [noteSubmittedFlag, setNoteSubmittedFlag] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = React.useState(null);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    getRecipe(id);
    console.log("INGREDIENTS WITH SUBS", ingredients);
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
      }, 0); // Small delay to allow React to complete the state update
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
      <MainGridContainer container direction="column">
      <Grid container spacing={4}>

        {/* LEFT COLUMN */}
        <Grid item xs={12} md={5}>
          {/* Image */}
          {recipe.image && (
            <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 3, mb: 2 }}>
              <img
                src={recipe.image}
                alt="Recipe"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>
          )}

          {/* Budget Mode */}
          <Button variant="contained" color="secondary" onClick={toggleBudgetMode} sx={{ borderRadius: 10, mr: 2 }}>
            {budgetMode ? 'Disable Budget Mode' : 'Enable Budget Mode'}
          </Button>

          {budgetMode && (
            <>
              <Button
                variant="contained"
                color="primary"
                sx={{ borderRadius: 10, mt: { xs: 2, sm: 0 } }}
                onClick={() => {
                  if (recipe.estimated_cost) {
                    addMealCost(recipe.recipe_id, recipe.estimated_cost);
                    setSnackbarOpen(true);
                  }
                }}
              >
                Add to This Week’s Meals
              </Button>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                <b>Estimated Cost:</b>{' '}
                <span style={{ color: recipe.estimated_cost === 0 ? 'green' : 'black' }}>
                  ${recipe.estimated_cost?.toFixed(2) || '0.00'}
                </span>
              </Typography>
            </>
          )}

          {/* Video */}
          {recipe.video && (
            <Box sx={{ mb: 4, mt: 9 }}>
              <Typography variant="h6"><b>Video:</b></Typography>
              <iframe width="500" height="350" src={recipe.video} title="Recipe Video" allowFullScreen></iframe>
            </Box>
          )}
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 3, borderRadius: 4, boxShadow: 3 }}>
            {/* Details */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              <b>Category:</b> {recipe.category} |
              <b> Type:</b> {recipe.type} |
              <b> Target Goal:</b> {recipe.goals || 'N/A'} |
              <b> Time:</b> {recipe.prep_time} mins | 
              <b> Average Rating: </b>{averageRating ? `⭐ ${averageRating.toFixed(1)}` : "N/A"}
            </Typography>

            {/* Ingredients */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
              Ingredients <Typography variant="caption">(required **)</Typography>
            </Typography>

            {recipe.ingredients?.map((ing) => {
              let displayQuantity = ing.quantity;
              if (ing.required === 1 && baseQuantity[ing.ingredient_id] && baseIngredientId) {
                const baseScale = baseIngredientId === ing.ingredient_id
                  ? sliderValue / baseQuantity[baseIngredientId]
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
                    alignItems: 'flex-start',
                    gap: 2,
                    my: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Ingredient name & price */}
                  <Box sx={{ flex: '1' }}>
                    <Typography variant="body1">
                      {formattedQuantity} {ing.quantity_type} {ing.name} {ing.required === 1 ? '*' : ''}
                    </Typography>
                    <PriceDisplay
                      price={ing.price}
                      ingredientId={ing.ingredient_id}
                      alwaysAvailable={userData?.alwaysAvailable?.map(item => item.ingredient_id)}
                    />
                  </Box>
              
                  {/* Substitutes */}
                  <Box>
                    <Typography variant="body2">
                      {subList}
                    </Typography>
                  </Box>
                </Box>
              );                  
            })}

            {/* Scale */}
            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}><b>Scale:</b></Typography>
                <Box sx={{width: 250}}><Slider
                    value={sliderValue}
                    onChange={handleScaleChange}
                    step={1}
                    marks
                    min={sliderMin}
                    max={sliderMax}
                    valueLabelDisplay="auto"
                  />
                </Box>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="base-ingredient-label">Base Ingredient</InputLabel>
                <Select
                  labelId="base-ingredient-label"
                  value={baseIngredientId || ''}
                  onChange={handleBaseIngredientChange}
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
            </Box>
          </Box>

          {/* Instructions */}
          <Box
            sx={{ p: 3, borderRadius: 4, boxShadow: 3, mt: 4 }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Instructions
            </Typography>

            <ol style={{ paddingLeft: '20px' }}>
              {recipe.instructions
                ?.split('.')
                .filter((step) => step.trim() !== '')
                .slice(0, 2)
                .map((step, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>
                    {step.trim()}.
                  </li>
                ))}

            {/* Remaining Instructions */}
            <Collapse in={showAllSteps} timeout="auto" unmountOnExit>
              <>
                {recipe.instructions
                  ?.split('.')
                  .filter((step) => step.trim() !== '')
                  .slice(2)
                  .map((step, index) => (
                    <li key={index + 2} style={{ marginBottom: '8px' }}>
                      {step.trim()}.
                    </li>
                  ))}
                </>
            </Collapse>
            </ol>

            {/* Toggle Button */}
            {recipe.instructions?.split('.').length > 2 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <IconButton onClick={() => setShowAllSteps(!showAllSteps)}>
                  {showAllSteps ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Reviews and notes */}
          <Note recipeId={id} noteSubmitted={handleNoteSubmitted} />
        </Grid>

        <ReviewList recipeId={id} reviews={reviews} averageRating={averageRating} getReviews={getReviews} />
      </Grid>
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
