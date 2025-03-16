import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, Paper, Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import Api from './Api';


const UploadRecipe = ({ onUploadSuccess }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cuisines, setCuisines] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(''); // single cuisine (type)
  const [prepTime, setPrepTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [ingredients, setIngredients] = useState([
    { ingredient_name: '', quantity: '', quantity_type: '', required: true }
  ]);  
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
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user');
        return res.json();
      })
      .then((data) => {
        let parsed;
        if (data.express) {
          parsed = JSON.parse(data.express);
        } else if (data.user) {
          parsed = data.user;
        } else {
          parsed = data;
        };
      })
      .catch((err) => console.error('Error fetching user:', err));

    const fetchCategoriesAndCuisines = async () => {
      const categoriesData = await Api.callApiGetCategories();
      setCategories(categoriesData || []);

      const cuisinesData = await Api.callApiGetCuisines();
      setCuisines(cuisinesData || []);
    };
    fetchCategoriesAndCuisines();

    const fetchIngredients = async () => {
      const ingredientsData = await Api.callApiGetIngredients();
      setAvailableIngredients(ingredientsData || []);
    };
    fetchIngredients();
  }, []);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];

    if (field === 'ingredient_name') {
      const ingredient = availableIngredients.find(ingredient => ingredient.name === value);
      newIngredients[index] = {
        ...newIngredients[index],
        ingredient_name: value,
        ingredient_id: ingredient ? ingredient.id : null
      };
    } else {
      newIngredients[index][field] = value;
    }
    setIngredients(newIngredients);
  };

  const handleRequiredChange = (index, checked) => {
    const newIngredients = [...ingredients];
    newIngredients[index].required = checked; // Update the 'required' field based on checkbox state
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { ingredient_name: '', quantity: '', quantity_type: '', required: true, estimated_cost: '' }]);
  };

  const removeIngredientField = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !prepTime || !instructions || ingredients.length === 0 || !selectedCategory || !selectedCuisine) {
      setMessage("Please fill all required fields.");
      return;
    }
    for (let ing of ingredients) {
      if (!ing.ingredient_name || !ing.quantity) {
        setMessage("Each ingredient must have a name and quantity.");
        return;
      }
    }
    const payload = {
      user_id: localStorage.getItem('firebase_uid'),
      name,
      category: selectedCategory,
      type: selectedCuisine,
      prep_time: prepTime,
      instructions,
      image,
      ingredients: ingredients.map(ingredient => ({
        ingredient_id: ingredient.ingredient_id,
        ingredient_name: ingredient.ingredient_name,
        quantity: ingredient.quantity,
        quantity_type: ingredient.quantity_type,
        required: ingredient.required
      }))      
    };
    console.log('Payload being sent to API:', payload);
    try {
      const res = await Api.callApiUploadRecipe(payload);

      if (res.message === "Recipe uploaded successfully") {
        setMessage("Recipe uploaded successfully!");
        setName('');
        setSelectedCategory('');
        setSelectedCuisine('');
        setPrepTime('');
        setInstructions('');
        setImage('');
        setIngredients([{ ingredient_name: '', quantity: '', quantity_type: '', required: true }]);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setMessage("Error: " + res.error);
      }
    } catch (error) {
      setMessage("Error uploading recipe.");
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Upload Recipe</Typography>
      {message && <Typography color="primary">{message}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField required label="Recipe Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Autocomplete
          options={categories}
          getOptionLabel={(option) => option}
          value={selectedCategory}
          onChange={(event, newValue) => setSelectedCategory(newValue)}
          renderInput={(params) => <TextField {...params} label="Category" />}
        />
        <Autocomplete
          options={cuisines}
          getOptionLabel={(option) => option}
          value={selectedCuisine}
          onChange={(event, newValue) => setSelectedCuisine(newValue)}
          renderInput={(params) => <TextField {...params} label="Cuisine Type" />}
        />
        <TextField required label="Estimated Cooking Time (mins)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
        <TextField required label="Preparation Steps (comma separated)" multiline rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        <TextField label="Image URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} />
        <TextField label="Embeded Video URL (optional)" value={image} onChange={(e) => setVideo(e.target.value)} />
        <Typography variant="subtitle1">Ingredients</Typography>
        {ingredients.map((ing, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Autocomplete
              options={availableIngredients}
              getOptionLabel={(option) => option.name}
              value={availableIngredients.find(ingredient => ingredient.name === ing.ingredient_name) || null}
              onChange={(event, newValue) => {
                handleIngredientChange(index, 'ingredient_name', newValue ? newValue.name : '');
              }}
              renderInput={(params) => <TextField {...params} label="Ingredient Name" />}
            />
            <TextField
              required
              label="Quantity"
              value={ing.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            />
            <TextField
              label="Quantity Type (optional)"
              value={ing.quantity_type}
              onChange={(e) => handleIngredientChange(index, 'quantity_type', e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox checked={ing.required} onChange={(e) => handleRequiredChange(index, e.target.checked)} />}
              label="Required"
            />
            <Button variant="outlined" onClick={() => removeIngredientField(index)}>Delete</Button>
          </Box>
        ))}
        <Button variant="outlined" onClick={addIngredientField}>Add Ingredient</Button>

        <Button variant="contained" type="submit">Upload Recipe</Button>
      </Box>
    </Paper>
  );
};

export default UploadRecipe;
