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
    
    // State for ingredients and recipes
    const [allIngredients, setAllIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [allCuisines, setAllCuisines] = useState([]);
    const [selectedCuisines, setSelectedCuisines] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [maxTime, setMaxTime] = useState('');
    const [manualIngredient, setManualIngredient] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [budgetMode, setBudgetMode] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    //Add ingredient manually when user types and presses "Add"
    const handleManualAdd = () => {
        if (manualIngredient.trim() !== "" && !selectedIngredients.includes(manualIngredient)) {
            setSelectedIngredients([...selectedIngredients, manualIngredient]);
            setManualIngredient(""); // Clear input after adding
        }
    };

    //Handle ingredient selection from dropdown
    const handleIngredientChange = (event, newValue) => {
        setSelectedIngredients(newValue);
    };

    //Function to fetch recommended recipes
    const handleSearch = async () => {
        if (selectedIngredients.length === 0) {
            setError("Please select or type at least one ingredient.");
            return;
        }

        setError('');
        setLoading(true);

        try {
            const maxTimeInt = maxTime ? parseInt(maxTime, 10) : null;
            const recommendedRecipes = await Api.callApiRecommendRecipes(selectedIngredients, selectedCuisines, selectedCategories, budgetMode, maxTimeInt);
            setRecipes(recommendedRecipes || []);
        } catch (error) {
            console.error("Error fetching recommended recipes:", error);
            setRecipes([]);
            setError("Failed to fetch recipe recommendations.");
        } finally {
            setLoading(false);
        }
    };


    //Handle Multi Select
    const handleMultiSelectChange = (event, newValue, field) => {
        if (field == 'cuisines') {
            setSelectedCuisines(newValue);
        }
        if (field == 'categories') {
            setSelectedCategories(newValue);
        }
    };

    return (
        <>
            <LetmecookAppBar page="Search" />
            <Box sx={{
                maxWidth: '100%', padding: '2rem', width: '100vw', height: '100vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>
                <Typography variant="h4" sx={{ marginBottom: 2 }}>Find a Recipe</Typography>

                {/*Box 1: Manual Input for Custom Ingredients */}
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
                        value.map((option, index) => <Chip key={option} label={option} {...getTagProps({ index })} color="primary" />)
                    }
                    renderInput={(params) => <TextField {...params} label="Select Ingredients" variant="outlined" />}
                    sx={{ width: 400, marginBottom: 2 }}
                />
                <Typography variant="body2"><strong>Filters:</strong></Typography>
                <Autocomplete
                    multiple
                    options={allCuisines}
                    value={selectedCuisines}
                    onChange={(event, newValue) => {
                        handleMultiSelectChange(event, newValue, "cuisines");
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Cuisines" />
                    )}
                    sx={{ width: 400, marginBottom: 2 }}
                />
                <Autocomplete
                    multiple
                    options={allCategories}
                    value={selectedCategories}
                    onChange={(event, newValue) => {
                        handleMultiSelectChange(event, newValue, "categories");
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Categories" />
                    )}
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
                    onClick={() => setBudgetMode(!budgetMode)}
                    sx={{ marginBottom: 2 }}
                >
                    {budgetMode ? "Disable Budget Mode" : "Enable Budget Mode"}
                </Button>

                {/* Search Button */}
                <Button variant="contained" color="primary" onClick={handleSearch} sx={{ marginBottom: 2 }}>
                    {loading ? <CircularProgress size={24} /> : "Find Recipes"}
                </Button>

                {/* Error Message */}
                {error && <Typography color="error">{error}</Typography>}

                {/* Recipe Results */}
                <Box sx={{ width: '80%', marginTop: 2 }}>
                    {loading ? (
                        <CircularProgress />
                    ) : recipes.length === 0 ? (
                        <Typography variant="h6">No recipes found.</Typography>
                    ) : (
                        recipes.map(recipe => (
                            <Box key={recipe.recipe_id} sx={{ border: '1px solid #ccc', padding: 2, marginBottom: 2, borderRadius: '8px', backgroundColor: '#fff' }}>
                                <Typography variant="h6"><Link onClick={() => navigate('/Recipe/'+recipe.recipe_id)}>{recipe.name}</Link></Typography>
                                <Typography variant="body2"><strong>Type:</strong> {recipe.type}</Typography>
                                <Typography variant="body2"><strong>Category:</strong> {recipe.category}</Typography>
                                <Typography variant="body2"><strong>Time:</strong> {recipe.prep_time} mins</Typography>
                                <Typography variant="body2"><strong>Instructions:</strong> click on link to see intructions </Typography>
                                {recipe.image && (
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <img src={recipe.image} alt="Recipe" style={{ width: '50%', borderRadius: 8 }} />
                                    </Box>
                                )}
                                {recipe.missingIngredients?.length > 0 && (
                                    <>
                                        <Typography variant="body2" sx={{ color: "red", marginTop: 1 }}>
                                            Missing Ingredients:
                                        </Typography>
                                        {recipe.missingIngredients.map(missing => (
                                            <Typography key={missing.name} variant="body2">
                                                {missing.name} {budgetMode && missing.suggestedSubstitute ? `(Suggested Substitute: ${missing.suggestedSubstitute}, Est. Cost: $${missing.estimatedCost})` : ""}
                                            </Typography>
                                        ))}
                                    </>
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
