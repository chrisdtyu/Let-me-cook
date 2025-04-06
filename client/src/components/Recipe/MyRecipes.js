import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LetmecookAppBar from '../AppBar';
import UploadRecipe from './UploadRecipes';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [user_id, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (!firebaseUid) {
      alert('You must log in first!');
      return;
    }

    // If your backend expects a numeric user_id, convert it appropriately
    setUserId(firebaseUid);
  }, []);

  useEffect(() => {
    if (user_id) {
      loadRecipes();
    }
  }, [user_id]);

  const loadRecipes = async () => {
    try {
      const res = await fetch('/api/getMyRecipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      });
      const data = await res.json();
      if (!res.ok || !data.recipes) {
        throw new Error(data.error || "Failed to fetch recipes");
      }
      setRecipes(data.recipes);
      setMessage('');
    } catch (error) {
      console.error("Error loading recipes:", error);
      setMessage(error.message);
    }
  };

  const handleDelete = async (recipe_id) => {
    try {
      const res = await fetch('/api/deleteRecipe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, recipe_id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Recipe deleted successfully.");
        loadRecipes();
      } else {
        setMessage("Error deleting recipe: " + data.error);
      }
    } catch (error) {
      setMessage("Error deleting recipe.");
    }
  };

  const handleUploadSuccess = () => {
    loadRecipes();
    setShowUploadForm(false);
    setEditingRecipe(null);
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setShowUploadForm(true); // ensure form is shown when editing
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
    setShowUploadForm(false);
  };

  return (
    <>
      <LetmecookAppBar page="My Recipes" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>My Recipes</Typography>
        {message && <Typography color="primary">{message}</Typography>}

        {!editingRecipe && (
          <Button
            variant="contained"
            onClick={() => setShowUploadForm(prev => !prev)}
            sx={{ mb: 3 }}
          >
            {showUploadForm ? "Hide Upload Form" : "Upload New Recipe"}
          </Button>
        )}

        {showUploadForm && (
          <UploadRecipe
            editingRecipe={editingRecipe}
            onUploadSuccess={handleUploadSuccess}
          />
        )}

        {editingRecipe && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancelEdit}
            sx={{ mt: 2 }}
          >
            Cancel Edit
          </Button>
        )}

        {recipes.length === 0 ? (
          <Typography>No recipes found.</Typography>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {recipes.map(recipe => (
              <Grid item xs={12} sm={6} md={4} key={recipe.recipe_id}>
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
                  <Typography variant="h6">
                    <Link
                      onClick={() => navigate('/Recipe/' + recipe.recipe_id)}
                      sx={{ cursor: 'pointer', color: 'blue' }}
                    >
                      {recipe.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2">Prep Time: {recipe.prep_time} mins</Typography>
                  <Typography variant="body2">Category: {recipe.category}</Typography>
                  <Typography variant="body2">Type: {recipe.type}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{recipe.instructions}</Typography>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={() => handleEdit(recipe)}>
                      Edit Recipe
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(recipe.recipe_id)}
                    >
                      Delete Recipe
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default MyRecipes;
