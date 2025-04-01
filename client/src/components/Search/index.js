import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LetmecookAppBar from '../AppBar';
import Api from './Api';
import Box from '@mui/material/Box';
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

    const [allIngredients, setAllIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [manualIngredient, setManualIngredient] = useState("");

    const [allCuisines, setAllCuisines] = useState([]);
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [maxTime, setMaxTime] = useState('');
    //const [budgetMode, setBudgetMode] = useState(false);

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


    // get user data if logged in
    useEffect(() => {
        const firebaseUid = localStorage.getItem('firebase_uid');
        if (firebaseUid) {
            setIsUserLoggedIn(true);
            fetch('/api/getUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebase_uid: firebaseUid }),
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch user from MySQL");
                    return res.json();
                })
                .then((data) => {
                    let parsed;
                    if (data.express) {
                        parsed = JSON.parse(data.express);
                    } else {
                        parsed = data;
                    }
                    if (parsed && parsed.user_id) {
                        setUserId(parsed.user_id);
                        fetch('/api/getUserRecipes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: parsed.user_id }),
                        })
                            .then(r => r.json())
                            .then((info) => {
                                const triedSet = new Set(info.tried?.map(r => r.recipe_id));
                                const favSet = new Set(info.favourites?.map(r => r.recipe_id));
                                setTriedRecipes(triedSet);
                                setFavRecipes(favSet);
                            });
                    }
                })
                .catch(err => console.error("Error in auto-login getUser:", err));
        }
    }, []);

    // Fetch ingredients from the database on component mount
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const data = await Api.getIngredients();
                const ingredients = data.map((i) => i.name);
                setAllIngredients(ingredients);
            } catch (err) {
                console.error("Error fetching ingredients:", err);
                setError("Failed to load ingredients.");
            }
        };
        const fetchCuisines = async () => {
            try {
                const cuisines = await Api.getCuisines();
                setAllCuisines(cuisines);
            } catch (err) {
                console.error("Error fetching cuisines:", err);
                setError("Failed to load cuisines.");
            }
        };
        const fetchCategories = async () => {
            try {
                const categories = await Api.getCategories();
                setAllCategories(categories);
            } catch (err) {
                console.error("Error fetching Categories:", err);
                setError("Failed to load Categories.");
            }
        };
        fetchIngredients();
        fetchCuisines();
        fetchCategories();
    }, []);

    // Add ingredient manually when user types and presses "Add"
    const handleManualAdd = () => {
        if (manualIngredient.trim() !== "" && !selectedIngredients.includes(manualIngredient)) {
            setSelectedIngredients([...selectedIngredients, manualIngredient]);
            setManualIngredient("");
        }
    };

    // Handle ingredient selection from dropdown
    const handleIngredientChange = (event, newValue) => {
        setSelectedIngredients(newValue);
    };

    // Handle Multi Select
    const handleMultiSelectChange = (event, newValue, field) => {
        if (field === 'cuisines') {
            setSelectedCuisines(newValue);
        } else if (field === 'categories') {
            setSelectedCategories(newValue);
        }
    };

    // Function to fetch recommended recipes
    const handleSearch = async () => {
        if (selectedIngredients.length === 0) {
            setError("Please select or type at least one ingredient.");
            return;
        }
        setError('');
        setLoading(true);
        try {
            const maxTimeInt = maxTime ? parseInt(maxTime, 10) : null;
            const recommendedRecipes = await Api.callApiRecommendRecipes(
                selectedIngredients,
                selectedCuisines,
                selectedCategories,
                budgetMode,
                maxTimeInt
            );

            // Apply sorting after fetching recipes
            const sortedRecipes = sortRecipes(recommendedRecipes);
            setRecipes(Array.isArray(sortedRecipes) ? sortedRecipes : []);
        } catch (error) {
            console.error("Error fetching recommended recipes:", error);
            setRecipes([]);
            setError("Failed to fetch recipe recommendations.");
        } finally {
            setLoading(false);
        }
    };

    
    // Toggle "Mark as Tried" / "Unmark Tried"
    const handleToggleTried = async (recipeId) => {
        if (!isUserLoggedIn || !userId) {
            alert("Please log in first!");
            return;
        }
        const alreadyTried = triedRecipes.has(recipeId);
        try {
            if (alreadyTried) {
                // Unmark
                const result = await Api.unmarkTried(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(triedRecipes);
                    newSet.delete(recipeId);
                    setTriedRecipes(newSet);
                    //alert("Recipe unmarked as tried.");
                    setSnackbarMessage("Recipe unmarked as tried");
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                }
            } else {
                // Mark
                const result = await Api.markTried(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(triedRecipes);
                    newSet.add(recipeId);
                    setTriedRecipes(newSet);
                    //alert("Recipe marked as tried!");
                    setSnackbarMessage("Recipe marked as tried!");
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                }
            }
        } catch (err) {
            console.error(err);
            alert("Error toggling tried.");
        }
    };

    // Toggle "Mark as Favourite" / "Unmark Favourite"
    const handleToggleFavourite = async (recipeId) => {
        if (!isUserLoggedIn || !userId) {
            alert("Please log in first!");
            return;
        }
        const alreadyFav = favRecipes.has(recipeId);
        try {
            if (alreadyFav) {
                // Unmark
                const result = await Api.unmarkFavourite(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(favRecipes);
                    newSet.delete(recipeId);
                    setFavRecipes(newSet);
                    //alert("Recipe unmarked as favourite.");
                    setSnackbarMessage("Recipe unmarked as favourite");
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                }
            } else {
                // Mark
                const result = await Api.markFavourite(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(favRecipes);
                    newSet.add(recipeId);
                    setFavRecipes(newSet);
                    //alert("Recipe marked as favourite!");
                    setSnackbarMessage("Recipe marked as favourite!");
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                }
            }
        } catch (err) {
            console.error(err);
            alert("Error toggling favourite.");
        }
    };

    // Display a message for mark as tried and mark as favorite
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
      };
      


    // Sort recipes by missing ingredients and time with ascending/descending options
    const sortRecipes = (recipes) => {
        let sortedRecipes = [...recipes];

        const isAscending = selectedSortOrder === "ascending";

        if (selectedSortOption === "missingIngredients") {
            sortedRecipes = sortedRecipes.sort((a, b) => {
                return isAscending
                    ? a.missingIngredients.length - b.missingIngredients.length
                    : b.missingIngredients.length - a.missingIngredients.length;
            });
        } else if (selectedSortOption === "time") {
            sortedRecipes = sortedRecipes.sort((a, b) => {
                return isAscending
                    ? a.prep_time - b.prep_time
                    : b.prep_time - a.prep_time;
            });
        }

        return sortedRecipes;
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
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Find a Recipe!
                </Typography>

                {/* Box 1: Search Filters */}
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '600px',
                        padding: '2rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: 2,
                        marginBottom: 3,
                    }}
                >
                    {/* Box 1: Manual Input */}
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", marginBottom: 2 }}>
                        <TextField
                            label="Enter an ingredient"
                            variant="outlined"
                            value={manualIngredient}
                            onChange={(e) => setManualIngredient(e.target.value)}
                            sx={{ width: 300 }}
                        />
                        <Button variant="contained" color="primary" onClick={handleManualAdd}>
                            Add
                        </Button>
                    </Box>

                    {/* Box 2: Select from Preset Ingredients */}
                    <Autocomplete
                        multiple
                        options={allIngredients} // Predefined ingredient list
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
                        sx={{ width: 400, marginBottom: 2 }}
                    />

                    <Typography variant="body2">
                        <strong>Filters:</strong>
                    </Typography>
                    <Autocomplete
                        multiple
                        options={allCuisines}
                        value={selectedCuisines}
                        onChange={(event, newValue) => handleMultiSelectChange(event, newValue, "cuisines")}
                        renderInput={(params) => <TextField {...params} label="Cuisines" />}
                        sx={{ width: 400, marginBottom: 2 }}
                    />
                    <Autocomplete
                        multiple
                        options={allCategories}
                        value={selectedCategories}
                        onChange={(event, newValue) => handleMultiSelectChange(event, newValue, "categories")}
                        renderInput={(params) => <TextField {...params} label="Categories" />}
                        sx={{ width: 400, marginBottom: 2 }}
                    />

                    <TextField
                        label="Max Time (minutes)"
                        variant="outlined"
                        type="number"
                        value={maxTime}
                        onChange={(e) => setMaxTime(e.target.value)}
                        sx={{ width: 400, marginBottom: 2 }}
                    />

                    {/* Budget Mode Toggle */}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={toggleBudgetMode}
                        sx={{ marginBottom: 2 }}
                    >
                        {budgetMode ? "Disable Budget Mode" : "Enable Budget Mode"}
                    </Button>

                    {/* Search Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        sx={{ marginBottom: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Find Recipes"}
                    </Button>

                    {/* Error Message */}
                    {error && <Typography color="error">{error}</Typography>}

                    {/* Sort By Option */}
                    <TextField
                        select
                        label="Sort By"
                        value={selectedSortOption}
                        onChange={(e) => setSelectedSortOption(e.target.value)}
                        SelectProps={{
                            native: true,
                        }}
                        sx={{ width: 400, marginBottom: 2 }}
                    >
                        <option value="none">None</option>
                        <option value="missingIngredients">Number of Missing Ingredients</option>
                        <option value="time">Preparation Time</option>
                    </TextField>

                    {/* Sort Order Option */}
                    <TextField
                        select
                        label="Sort Order"
                        value={selectedSortOrder}
                        onChange={(e) => setSelectedSortOrder(e.target.value)}
                        SelectProps={{
                            native: true,
                        }}
                        sx={{ width: 400, marginBottom: 2 }}
                    >
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </TextField>
                </Box>

                {/* Recipe Results */}
                <Box sx={{ width: '80%', marginTop: 2 }}>
                    {loading ? (
                        <CircularProgress />
                    ) : recipes.length === 0 ? (
                        <Typography variant="h6">No recipes found.</Typography>
                    ) : (
                        recipes.map(recipe => (
                            <Box
                                key={recipe.recipe_id}
                                sx={{
                                    border: '1px solid #ccc',
                                    padding: 2,
                                    marginBottom: 2,
                                    borderRadius: '8px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <Typography variant="h6">
                                    <Link onClick={() => navigate('/Recipe/' + recipe.recipe_id)}>
                                        {recipe.name}
                                    </Link>
                                </Typography>
                                <Typography variant="body2"><strong>Type:</strong> {recipe.type}</Typography>
                                <Typography variant="body2"><strong>Category:</strong> {recipe.category}</Typography>
                                <Typography variant="body2"><strong>Time:</strong> {recipe.prep_time} mins</Typography>
                                <Typography variant="body2">
                                    <strong>Instructions:</strong> {recipe.instructions.slice(0, 100)}...
                                </Typography>

                                
                                {/* If the recipe has an image, display it */}
                                {recipe.image && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <img
                                            src={recipe.image}
                                            alt="Recipe"
                                            style={{ width: '50%', borderRadius: 8 }}
                                        />
                                    </Box>
                                )}

                                {/* Missing Ingredients */}
                                {recipe.missingIngredients?.length > 0 && (
                                    <>
                                        <Typography variant="body2" sx={{ color: "red", marginTop: 1 }}>
                                            Missing Ingredients ({recipe.missingIngredients.length}):
                                        </Typography>
                                        {recipe.missingIngredients.map(missing => (
                                            <Typography key={missing.name} variant="body2">
                                                {missing.name}{" "}
                                                {budgetMode && missing.suggestedSubstitute
                                                    ? `(Suggested: ${missing.suggestedSubstitute}, $${missing.estimatedCost})`
                                                    : ""}
                                            </Typography>
                                        ))}
                                    </>
                                )}

                                {/* Mark/Unmark Tried & Favourite Buttons - moved to right side */}
                                {/* Mark/Unmark Tried & Favourite Buttons */}
                                {isUserLoggedIn && userId && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleToggleTried(recipe.recipe_id)}
                                        >
                                            {triedRecipes.has(recipe.recipe_id)
                                                ? "Unmark Tried"
                                                : "Mark as Tried"}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleToggleFavourite(recipe.recipe_id)}
                                        >
                                            {favRecipes.has(recipe.recipe_id)
                                                ? "Unmark Favourite"
                                                : "Mark as Favourite"}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        ))
                    )}
                </Box>
            </Box>
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
        </>
    );
};

export default Search;