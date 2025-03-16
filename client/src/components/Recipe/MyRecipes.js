import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import LetmecookAppBar from '../AppBar';
import UploadRecipe from './UploadRecipes'; // Adjust the path if necessary

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const user_id = localStorage.getItem('user_id');

  // Function to load the user's recipes
  const loadRecipes = async () => {
    try {
      const res = await fetch('/api/getMyRecipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setRecipes(data.recipes);
      }
    } catch (error) {
      setMessage("Error loading recipes.");
    }
  };

  useEffect(() => {
    if (user_id) {
      loadRecipes();
    } else {
      setMessage("Please log in to view your recipes.");
    }
  }, [user_id]);

  // Delete a recipe
  const handleDelete = async (recipe_id) => {
    try {
      const res = await fetch('/api/deleteRecipe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, recipe_id })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Recipe deleted successfully.");
        // Reload recipes after deletion
        loadRecipes();
      } else {
        setMessage("Error deleting recipe: " + data.error);
      }
    } catch (error) {
      setMessage("Error deleting recipe.");
    }
  };

  return (
    <>
      <LetmecookAppBar page="My Recipes" />
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>My Recipes</Typography>
        {message && <Typography color="primary">{message}</Typography>}
        <Button 
          variant="contained" 
          onClick={() => setShowUploadForm(!showUploadForm)}
          sx={{ mb: 2 }}
        >
          {showUploadForm ? "Hide Upload Form" : "Upload New Recipe"}
        </Button>
        {showUploadForm && <UploadRecipe onUploadSuccess={loadRecipes} />}
        {recipes.length === 0 ? (
          <Typography>No recipes found.</Typography>
        ) : (
          recipes.map(recipe => (
            <Paper key={recipe.recipe_id} sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6">{recipe.name}</Typography>
              <Typography>Prep Time: {recipe.prep_time} mins</Typography>
              <Typography>Category: {recipe.category}</Typography>
              <Typography>Type: {recipe.type}</Typography>
              <Typography>Instructions: {recipe.instructions}</Typography>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => handleDelete(recipe.recipe_id)}
                sx={{ mt: 1 }}
              >
                Delete Recipe
              </Button>
            </Paper>
          ))
        )}
      </Box>
    </>
  );
};

export default MyRecipes;
