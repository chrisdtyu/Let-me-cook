import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Paper } from '@mui/material';
import LetmecookAppBar from '../AppBar';

const UploadRecipe = ({ onUploadSuccess }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [instructions, setInstructions] = useState('');
  const [image, setImage] = useState('');
  const [allergens, setAllergens] = useState('');
  const [ingredients, setIngredients] = useState([
    { ingredient_id: '', quantity: '', quantity_type: '', required: true, estimated_cost: '' }
  ]);
  const [message, setMessage] = useState('');

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, { ingredient_id: '', quantity: '', quantity_type: '', required: true, estimated_cost: '' }]);
  };

  const removeIngredientField = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !prepTime || !instructions || ingredients.length === 0) {
      setMessage("Please fill all required fields.");
      return;
    }
    for (let ing of ingredients) {
      if (!ing.ingredient_id || !ing.quantity) {
        setMessage("Each ingredient must have an ingredient_id and quantity.");
        return;
      }
    }
    const payload = {
      user_id: localStorage.getItem('user_id'),
      name,
      category,
      type,
      prep_time: prepTime,
      instructions,
      image,
      allergens: allergens ? allergens.split(',').map(a => a.trim()) : [],
      ingredients
    };
    try {
      const res = await fetch('/api/uploadRecipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Recipe uploaded successfully!");
        setName('');
        setCategory('');
        setType('');
        setPrepTime('');
        setInstructions('');
        setImage('');
        setAllergens('');
        setIngredients([{ ingredient_id: '', quantity: '', quantity_type: '', required: true, estimated_cost: '' }]);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (error) {
      setMessage("Error uploading recipe.");
    }
  };

  return (
    <>
      <Paper sx={{ p: 4, maxWidth: 600, margin: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>Upload Recipe</Typography>
        {message && <Typography color="primary">{message}</Typography>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField required label="Recipe Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
          <TextField label="Type" value={type} onChange={(e) => setType(e.target.value)} />
          <TextField required label="Estimated Cooking Time (mins)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
          <TextField
            required
            label="Preparation Steps"
            multiline
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <TextField label="Image URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} />
          <TextField label="Allergens (comma separated, optional)" value={allergens} onChange={(e) => setAllergens(e.target.value)} />
          <Typography variant="subtitle1">Ingredients</Typography>
          {ingredients.map((ing, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                required
                label="Ingredient ID"
                value={ing.ingredient_id}
                onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
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
              <TextField
                label="Estimated Cost (optional)"
                type="number"
                value={ing.estimated_cost}
                onChange={(e) => handleIngredientChange(index, 'estimated_cost', e.target.value)}
              />
              <Button variant="outlined" onClick={() => removeIngredientField(index)}>Delete</Button>
            </Box>
          ))}
          <Button variant="outlined" onClick={addIngredientField}>Add Ingredient</Button>
          <Button variant="contained" type="submit">Upload Recipe</Button>
        </Box>
      </Paper>
    </>
  );
};

export default UploadRecipe;
