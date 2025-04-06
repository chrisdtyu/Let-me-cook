import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, Paper, Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import Api from './Api';

const UploadRecipe = ({ onUploadSuccess, editingRecipe = null }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [message, setMessage] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState([]);

  useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (!firebaseUid) {
      alert('You must log in first!');
      return;
    }

    fetch('/api/getUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebase_uid: firebaseUid }),
    }).catch((err) => console.error('Error fetching user:', err));

    const fetchData = async () => {
      const categoriesData = await Api.callApiGetCategories();
      setCategories(categoriesData || []);
      const cuisinesData = await Api.callApiGetCuisines();
      setCuisines(cuisinesData || []);
      const ingredientsData = await Api.callApiGetIngredients();
      setAvailableIngredients(ingredientsData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editingRecipe) {
      setName(editingRecipe.name || '');
      setSelectedCategory(editingRecipe.category || '');
      setSelectedCuisine(editingRecipe.type || '');
      setPrepTime(editingRecipe.prep_time || '');
      setInstructions(editingRecipe.instructions || '');
      setImage(editingRecipe.image || '');
      setVideo(editingRecipe.video || '');
      Api.callApiGetRecipeIngredients(editingRecipe.recipe_id)
        .then(data => {
          setIngredients(data.map(i => ({
            ingredient_name: i.name,
            quantity: i.quantity,
            quantity_type: i.quantity_type,
            required: i.required,
            ingredient_id: i.ingredient_id
          })));
        })
        .catch(err => {
          console.error('Failed to load ingredients:', err);
          setIngredients([]);
        });
    } else {
      setIngredients([{ ingredient_name: '', quantity: '', quantity_type: '', required: true }]);
    }
  }, [editingRecipe]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    if (field === 'ingredient_name') {
      const ingredient = availableIngredients.find(i => i.name === value);
      newIngredients[index] = {
        ...newIngredients[index],
        ingredient_name: value,
        ingredient_id: ingredient ? ingredient.ingredient_id : null
      };
    } else {
      newIngredients[index][field] = value;
    }
    setIngredients(newIngredients);
  };

  const handleRequiredChange = (index, checked) => {
    const newIngredients = [...ingredients];
    newIngredients[index].required = checked;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { ingredient_name: '', quantity: '', quantity_type: '', required: true }]);
  };

  const removeIngredientField = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = Boolean(editingRecipe);
    const firebaseUid = localStorage.getItem('firebase_uid');

    if (!firebaseUid) {
      setMessage("User not authenticated");
      return;
    }

    if (!name || !prepTime || !instructions) {
      setMessage("Please fill all required fields (Name, Prep Time, Instructions).");
      return;
    }

    // Upload mode: ingredients required
    if (!isEditing && (!ingredients || ingredients.length === 0)) {
      setMessage("Please include at least one ingredient.");
      return;
    }

    // Validate any provided ingredients
    const hasAnyIngredient = ingredients && ingredients.length > 0;
    if (hasAnyIngredient) {
      for (let ing of ingredients) {
        if (!ing.ingredient_name || !ing.quantity) {
          setMessage("Each ingredient must have a name and quantity.");
          return;
        }
      }
    }

    const payload = {
      user_id: firebaseUid,
      name,
      category: selectedCategory || null,
      type: selectedCuisine || null,
      prep_time: prepTime,
      instructions,
      image,
      video,
      ingredients: ingredients
        .filter(i => i.ingredient_name && i.quantity)
        .map(ingredient => ({
          ingredient_id: ingredient.ingredient_id,
          ingredient_name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          quantity_type: ingredient.quantity_type,
          required: ingredient.required
        }))
    };

    try {
      const res = isEditing
        ? await Api.callApiEditRecipe({ ...payload, recipe_id: editingRecipe.recipe_id })
        : await Api.callApiUploadRecipe(payload);

      if (res.message?.includes("successfully")) {
        setMessage(res.message);
        if (!isEditing) {
          setName('');
          setSelectedCategory('');
          setSelectedCuisine('');
          setPrepTime('');
          setInstructions('');
          setImage('');
          setVideo('');
          setIngredients([{ ingredient_name: '', quantity: '', quantity_type: '', required: true }]);
        }
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setMessage("Error: " + (res.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Submission error:", error);
      setMessage("Error uploading or editing recipe.");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {editingRecipe ? "Edit Recipe" : "Upload Recipe"}
      </Typography>
      {message && <Typography color="primary">{message}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Recipe Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Autocomplete
          options={categories}
          getOptionLabel={(option) => option}
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          renderInput={(params) => <TextField {...params} label="Category" />}
        />
        <Autocomplete
          options={cuisines}
          getOptionLabel={(option) => option}
          value={selectedCuisine}
          onChange={(e, newValue) => setSelectedCuisine(newValue)}
          renderInput={(params) => <TextField {...params} label="Cuisine Type" />}
        />
        <TextField label="Estimated Cooking Time (mins)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
        <TextField label="Preparation Steps (comma separated)" multiline rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        <TextField label="Image URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} />
        <TextField label="Embedded Video URL (optional)" value={video} onChange={(e) => setVideo(e.target.value)} />

        <Typography variant="subtitle1">Ingredients</Typography>
        {ingredients.map((ing, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              options={availableIngredients}
              getOptionLabel={(option) => option.name}
              value={availableIngredients.find(i => i.name === ing.ingredient_name) || null}
              onChange={(e, newValue) => handleIngredientChange(index, 'ingredient_name', newValue ? newValue.name : '')}
              renderInput={(params) => <TextField {...params} label="Ingredient Name" />}
            />
            <TextField label="Quantity" value={ing.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} />
            <TextField label="Quantity Type (optional)" value={ing.quantity_type} onChange={(e) => handleIngredientChange(index, 'quantity_type', e.target.value)} />
            <FormControlLabel
              control={<Checkbox checked={ing.required} onChange={(e) => handleRequiredChange(index, e.target.checked)} />}
              label="Required"
            />
            <Button variant="outlined" onClick={() => removeIngredientField(index)}>Delete</Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={addIngredientField}>Add Ingredient</Button>

        <Button variant="contained" type="submit">
          {editingRecipe ? "Update Recipe" : "Upload Recipe"}
        </Button>
      </Box>
    </Paper>
  );
};

export default UploadRecipe;
