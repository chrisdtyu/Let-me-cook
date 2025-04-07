import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LetmecookAppBar from '../AppBar';
import Api from './Api';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useBudget } from '../Budget/BudgetContext';

const Search = () => {
  const navigate = useNavigate();

  const [allIngTypes, setAllIngTypes] = useState([]);
  const [selectedType, setSelectedType] = useState([]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [manualIngredient, setManualIngredient] = useState("");

  const [allCuisines, setAllCuisines] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxTime, setMaxTime] = useState('');
  const [restrictedIngredients, setRestrictedIngredients] = useState([]);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [userId, setUserId] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [triedRecipes, setTriedRecipes] = useState(new Set());
  const [favRecipes, setFavRecipes] = useState(new Set());

  const [selectedSortOption, setSelectedSortOption] = useState("none");
  const [selectedSortOrder, setSelectedSortOrder] = useState("ascending");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { budgetMode, toggleBudgetMode } = useBudget();
  const isFirstRender = useRef(true);

  useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (firebaseUid) {
      setIsUserLoggedIn(true);

      fetch('/api/getUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebase_uid: firebaseUid }),
      })
        .then((res) => res.json())
        .then((data) => {
          const parsed = data.express ? JSON.parse(data.express) : data;
          if (parsed?.user_id) {
            setUserId(parsed.user_id);

            fetch('/api/getUserRecipes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: parsed.user_id }),
            })
              .then(r => r.json())
              .then(info => {
                setTriedRecipes(new Set(info.tried?.map(r => r.recipe_id)));
                setFavRecipes(new Set(info.favourites?.map(r => r.recipe_id)));
              });

            Api.getUserProfile(firebaseUid)
              .then(alwaysAvailable => {
                const alwaysNames = alwaysAvailable
                  .map(item => item.ingredient_name)
                  .filter(Boolean);
                setSelectedIngredients(prev => [...new Set([...prev, ...alwaysNames])]);
              });

            Api.getUserSearchProfile(firebaseUid)
              .then(({ dietaryRestrictions }) => {
                setRestrictedIngredients(dietaryRestrictions || []);
              });
          }
        })
        .catch(err => console.error("Auto-login failed:", err));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingredients, cuisines, categories, ingTypes] = await Promise.all([
          Api.getIngredients(),
          Api.getCuisines(),
          Api.getCategories(),
          Api.getIngTypes()
        ]);
        setAllIngredients(ingredients.map(i => i.name));
        setAllCuisines(cuisines);
        setAllCategories(categories);
        setAllIngTypes(ingTypes);
      } catch (err) {
        console.error("Data fetch error:", err);
        setError("Failed to load data.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fetchFilteredIngredients = async () => {
      try {
        const data = await Api.getFilteredIngredients(selectedType);
        setFilteredIngredients(data.map(i => i.name));
      } catch (err) {
        console.error("Error fetching filtered ingredients:", err);
        setError("Could not filter ingredients.");
      }
    };
    fetchFilteredIngredients();
  }, [selectedType]);

  const handleManualAdd = () => {
    if (manualIngredient.trim() && !selectedIngredients.includes(manualIngredient)) {
      setSelectedIngredients([...selectedIngredients, manualIngredient]);
      setManualIngredient("");
    }
  };

  const handleIngredientChange = (_, newValue) => setSelectedIngredients(newValue);

  const handleMultiSelectChange = (event, newValue, field) => {
    if (field === 'cuisines') setSelectedCuisines(newValue);
    else if (field === 'categories') setSelectedCategories(newValue);
  };

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) {
      setError("Please select or type at least one ingredient.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const maxTimeInt = maxTime ? parseInt(maxTime, 10) : null;
      const recipes = await Api.callApiRecommendRecipes(
        selectedIngredients,
        selectedCuisines,
        selectedCategories,
        budgetMode,
        maxTimeInt,
        userId,
        restrictedIngredients
      );
      setRecipes(sortRecipes(recipes));
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("Failed to fetch recipe recommendations.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTried = async (recipeId) => {
    if (!isUserLoggedIn || !userId) return alert("Please log in first.");
    try {
      const already = triedRecipes.has(recipeId);
      const result = already
        ? await Api.unmarkTried(userId, recipeId)
        : await Api.markTried(userId, recipeId);
      if (result?.message) {
        const newSet = new Set(triedRecipes);
        already ? newSet.delete(recipeId) : newSet.add(recipeId);
        setTriedRecipes(newSet);
        setSnackbarMessage(already ? "Recipe unmarked as tried" : "Recipe marked as tried!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Toggle tried error:", err);
    }
  };

  const handleToggleFavourite = async (recipeId) => {
    if (!isUserLoggedIn || !userId) return alert("Please log in first.");
    try {
      const already = favRecipes.has(recipeId);
      const result = already
        ? await Api.unmarkFavourite(userId, recipeId)
        : await Api.markFavourite(userId, recipeId);
      if (result?.message) {
        const newSet = new Set(favRecipes);
        already ? newSet.delete(recipeId) : newSet.add(recipeId);
        setFavRecipes(newSet);
        setSnackbarMessage(already ? "Recipe unmarked as favourite" : "Recipe marked as favourite!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Toggle favourite error:", err);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const sortRecipes = (recipes) => {
    if (!Array.isArray(recipes)) return [];

    const sorted = [...recipes];
    const asc = selectedSortOrder === "ascending";

    const compareNumeric = (a, b, key) => {
      const valA = a[key] ?? 0;
      const valB = b[key] ?? 0;
      return asc ? valA - valB : valB - valA;
    };

    switch (selectedSortOption) {
      case "missingIngredients":
        sorted.sort((a, b) => {
          const aLen = a.missingIngredients?.length ?? 0;
          const bLen = b.missingIngredients?.length ?? 0;
          return asc ? aLen - bLen : bLen - aLen;
        });
        break;

      case "time":
        sorted.sort((a, b) => compareNumeric(a, b, "prep_time"));
        break;

      case "rating":
        sorted.sort((a, b) => compareNumeric(a, b, "average_rating"));
        break;

      case "estimatedCost":
        sorted.sort((a, b) => compareNumeric(a, b, "estimated_cost"));
        break;

      case "tried":
        sorted.sort((a, b) => {
          const triedA = triedRecipes.has(a.recipe_id) ? 1 : 0;
          const triedB = triedRecipes.has(b.recipe_id) ? 1 : 0;
          return asc ? triedA - triedB : triedB - triedA;
        });
        break;

      default:
        break;
    }

    return sorted;

  };


  return (
    <>
      <LetmecookAppBar page="Search" />
      <Box
        sx={{
          maxWidth: '100%',
          padding: '2rem',
          width: '100vw',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Find a Recipe!
          </Typography>
          <Button variant="contained" color="secondary" onClick={toggleBudgetMode}>
            {budgetMode ? "Disable Budget Mode" : "Enable Budget Mode"}
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '1200px',
            mb: 3,
          }}
        >
          {/* Ingredients Box */}
          <Box
            sx={{
              flex: 1,
              minWidth: '300px',
              padding: '1.5rem',
              backgroundColor: '#3e0907',
              borderRadius: '8px',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Enter an ingredient"
                variant="outlined"
                value={manualIngredient}
                onChange={(e) => setManualIngredient(e.target.value)}
                sx={{ backgroundColor: 'white', borderRadius: 1 }}
              />
              <Button variant="contained" color="primary" onClick={handleManualAdd} sx={{ whiteSpace: 'nowrap' }}>
                Add
              </Button>
            </Box>
            <Autocomplete
              multiple
              options={allIngTypes}
              value={selectedType}
              onChange={(event, newValue) => setSelectedType(newValue || [])}
              renderInput={(params) => <TextField {...params} label="Ingredient Type" />}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <Autocomplete
              multiple
              options={selectedType.length > 0 ? filteredIngredients : allIngredients}
              value={selectedIngredients}
              onChange={handleIngredientChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option}
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Select Ingredients" variant="outlined" />
              )}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            {restrictedIngredients.length > 0 && (
              <Typography variant="body2" color="white">
                <strong>Restricted:</strong> {restrictedIngredients.join(', ')}
              </Typography>
            )}
          </Box>

          {/* Filters Box */}
          <Box
            sx={{
              flex: 1,
              minWidth: '300px',
              padding: '1.5rem',
              backgroundColor: '#3e0907',
              borderRadius: '8px',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="white"><strong>Filters</strong></Typography>
            <Autocomplete
              multiple
              options={allCuisines}
              value={selectedCuisines}
              onChange={(e, newValue) => handleMultiSelectChange(e, newValue, "cuisines")}
              renderInput={(params) => <TextField {...params} label="Cuisines" />}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <Autocomplete
              multiple
              options={allCategories}
              value={selectedCategories}
              onChange={(e, newValue) => handleMultiSelectChange(e, newValue, "categories")}
              renderInput={(params) => <TextField {...params} label="Categories" />}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <TextField
              label="Max Time (minutes)"
              variant="outlined"
              type="number"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
          </Box>
        </Box>

        {/* Sorting Options */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '720px',
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <TextField
            select
            label="Sort By"
            value={selectedSortOption}
            onChange={(e) => setSelectedSortOption(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ width: 300 }}
          >
            <option value="none">None</option>
            <option value="missingIngredients">Number of Missing Ingredients</option>
            <option value="time">Preparation Time</option>
            <option value="rating">Rating</option>
            <option value="estimatedCost">Estimated Cost</option>
            <option value="tried">Tried</option>
          </TextField>
          <TextField
            select
            label="Sort Order"
            value={selectedSortOrder}
            onChange={(e) => setSelectedSortOrder(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ width: 300 }}
          >
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </TextField>
        </Box>

        {/* Search Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          sx={{ marginBottom: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : "🔍 Find Recipes"}
        </Button>

        {/* Recipe Results */}
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {loading ? (
            <CircularProgress />
          ) : recipes.length === 0 ? (
            <Typography variant="h6">No recipes found.</Typography>
          ) : (
            recipes.map(recipe => (
              <Grid item key={recipe.recipe_id} xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    padding: 2,
                    borderRadius: '8px',
                    backgroundImage: `url(${recipe.image || 'https://via.placeholder.com/150?text=No+Image'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: 250,
                  }}
                >
                  <Box sx={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2, p: 2 }}>
                    <Typography variant="h6">
                      <Link onClick={() => navigate('/Recipe/' + recipe.recipe_id)}>
                        {recipe.name}
                      </Link>
                    </Typography>
                    <Typography variant="body2"><strong>Type:</strong> {recipe.type}</Typography>
                    <Typography variant="body2"><strong>Category:</strong> {recipe.category}</Typography>
                    <Typography variant="body2"><strong>Target Goal:</strong> {recipe.goal || "N/A"}</Typography>
                    <Typography variant="body2"><strong>Time:</strong> {recipe.prep_time} mins</Typography>
                    {budgetMode && recipe.estimated_cost && (
                      <Typography variant="body2"><strong>Estimated Cost:</strong> ${recipe.estimated_cost}</Typography>
                    )}
                    <Typography variant="body2"><strong>Average Rating:</strong> {recipe.average_rating ? `⭐ ${recipe.average_rating.toFixed(1)}` : 'N/A'}</Typography>

                    {recipe.missingIngredients?.length > 0 ? (
                      <>
                        <Typography variant="body2" sx={{ color: 'red', mt: 1 }}>
                          Missing Ingredients ({recipe.missingIngredients.length}):
                        </Typography>
                        {recipe.missingIngredients.map(m => (
                          <Typography key={m.name} variant="body2">
                            {m.name}
                            {budgetMode && m.suggestedSubstitute
                              ? ` (Suggested: ${m.suggestedSubstitute}, $${m.estimatedCost})`
                              : ''}
                          </Typography>
                        ))}
                      </>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'green', mt: 1 }}>
                        <b>You have all ingredients, get cooking!</b>
                      </Typography>
                    )}

                    {isUserLoggedIn && userId && (
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => handleToggleTried(recipe.recipe_id)}
                        >
                          {triedRecipes.has(recipe.recipe_id) ? 'Unmark Tried' : 'Mark as Tried'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleToggleFavourite(recipe.recipe_id)}
                        >
                          {favRecipes.has(recipe.recipe_id)
                            ? 'Unmark Favourite'
                            : 'Mark as Favourite'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))
          )}
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    </>
  );

};

export default Search;