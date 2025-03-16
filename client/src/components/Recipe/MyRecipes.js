import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LetmecookAppBar from '../AppBar';
import UploadRecipe from './UploadRecipes';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [message, setMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [user_id, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (!firebaseUid) {
      alert('You must log in first!');
      return;
    }
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
      if (data.error) {
        setMessage(data.error);
      } else {
        setRecipes(data.recipes);
      }
    } catch (error) {
      setMessage("Error loading recipes.");
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

  return (
    <>
      <LetmecookAppBar page="My Recipes" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>My Recipes</Typography>
        {message && <Typography color="primary">{message}</Typography>}
        <Button 
          variant="contained" 
          onClick={() => setShowUploadForm(!showUploadForm)}
          sx={{ mb: 3 }}
        >
          {showUploadForm ? "Hide Upload Form" : "Upload New Recipe"}
        </Button>
        {showUploadForm && <UploadRecipe onUploadSuccess={loadRecipes} />}
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
                      sx={{cursor: 'pointer', color: 'blue'}}
                    >
                      {recipe.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2">Prep Time: {recipe.prep_time} mins</Typography>
                  <Typography variant="body2">Category: {recipe.category}</Typography>
                  <Typography variant="body2">Type: {recipe.type}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{recipe.instructions}</Typography>

                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => handleDelete(recipe.recipe_id)}
                    sx={{ mt: 1 }}
                  >
                    Delete Recipe
                  </Button>
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
