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
    const [budgetMode, setBudgetMode] = useState(false);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [userId, setUserId] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [triedRecipes, setTriedRecipes] = useState(new Set());
    const [favRecipes, setFavRecipes] = useState(new Set());

    const [selectedSortTime, setSelectedSortTime] = useState("none");

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

    const handleManualAdd = () => {
        if (manualIngredient.trim() !== "" && !selectedIngredients.includes(manualIngredient)) {
            setSelectedIngredients([...selectedIngredients, manualIngredient]);
            setManualIngredient("");
        }
    };

    const handleIngredientChange = (event, newValue) => {
        setSelectedIngredients(newValue);
    };

    const handleMultiSelectChange = (event, newValue, field) => {
        if (field === 'cuisines') {
            setSelectedCuisines(newValue);
        } else if (field === 'categories') {
            setSelectedCategories(newValue);
        }
    };

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
                userId,
                budgetMode,
                maxTimeInt
            );
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

    const handleToggleTried = async (recipeId) => {
        if (!isUserLoggedIn || !userId) {
            alert("Please log in first!");
            return;
        }
        const alreadyTried = triedRecipes.has(recipeId);
        try {
            if (alreadyTried) {
                const result = await Api.unmarkTried(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(triedRecipes);
                    newSet.delete(recipeId);
                    setTriedRecipes(newSet);
                    alert("Recipe unmarked as tried.");
                }
            } else {
                const result = await Api.markTried(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(triedRecipes);
                    newSet.add(recipeId);
                    setTriedRecipes(newSet);
                    alert("Recipe marked as tried!");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Error toggling tried.");
        }
    };

    const handleToggleFavourite = async (recipeId) => {
        if (!isUserLoggedIn || !userId) {
            alert("Please log in first!");
            return;
        }
        const alreadyFav = favRecipes.has(recipeId);
        try {
            if (alreadyFav) {
                const result = await Api.unmarkFavourite(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(favRecipes);
                    newSet.delete(recipeId);
                    setFavRecipes(newSet);
                    alert("Recipe unmarked as favourite.");
                }
            } else {
                const result = await Api.markFavourite(userId, recipeId);
                if (result && result.message) {
                    const newSet = new Set(favRecipes);
                    newSet.add(recipeId);
                    setFavRecipes(newSet);
                    alert("Recipe marked as favourite!");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Error toggling favourite.");
        }
    };

    const sortRecipes = (recipes) => {
        if (!Array.isArray(recipes)) return [];

        let sortedRecipes = [...recipes];
        if (selectedSortTime === "ascending") {
            sortedRecipes.sort((a, b) => a.prep_time - b.prep_time);
        } else if (selectedSortTime === "descending") {
            sortedRecipes.sort((a, b) => b.prep_time - a.prep_time);
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
                <Typography variant="h4" sx={{ marginBottom: 2 }}>
                    Find a Recipe
                </Typography>

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

                <Autocomplete
                    multiple
                    options={allIngredients}
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

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setBudgetMode(!budgetMode)}
                    sx={{ marginBottom: 2 }}
                >
                    {budgetMode ? "Disable Budget Mode" : "Enable Budget Mode"}
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    sx={{ marginBottom: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : "Find Recipes"}
                </Button>

                {error && <Typography color="error">{error}</Typography>}

                <TextField
                    select
                    label="Sort by Time"
                    value={selectedSortTime}
                    onChange={(e) => setSelectedSortTime(e.target.value)}
                    SelectProps={{
                        native: true,
                    }}
                    sx={{ width: 400, marginBottom: 2 }}
                >
                    <option value="none">None</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </TextField>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    sx={{ marginBottom: 2 }}
                >
                    {loading ? <CircularProgress size={24} /> : "Sort"}
                </Button>

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
                                    <strong>Instructions:</strong> click link to see details
                                </Typography>

                                {recipe.image && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                        <img
                                            src={recipe.image}
                                            alt="Recipe"
                                            style={{ width: '50%', borderRadius: 8 }}
                                        />
                                    </Box>
                                )}

                                {recipe.missingIngredients?.length > 0 && (
                                    <>
                                        <Typography variant="body2" sx={{ color: "red", marginTop: 1 }}>
                                            Missing Ingredients:
                                        </Typography>
                                        {recipe.missingIngredients.map(missing => (
                                            <Typography
                                                key={missing.name}
                                                variant="body2"
                                                sx={{ color: missing.required ? 'red' : 'orange' }}
                                            >
                                                {missing.required ? "(Mandatory) " : "(Optional) "}
                                                {missing.name}
                                                {budgetMode && missing.suggestedSubstitute
                                                    ? ` (Suggested: ${missing.suggestedSubstitute}, $${missing.estimatedCost})`
                                                    : ""
                                                }
                                            </Typography>
                                        ))}
                                    </>
                                )}

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
        </>
    );
};

export default Search;
