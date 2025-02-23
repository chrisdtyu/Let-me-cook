import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Button, Typography, Box, Container, FormControl
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const Profile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dietaryPreferences: [],   // Will store preference IDs
    dietaryRestrictions: [],  // Will store array of { dietary_id, dietary_name }
    alwaysAvailable: [],      // Will store array of { ingredient_id, name }
    healthGoals: "",
    weeklyBudget: "",
  });

  // We will fetch our list options for each dropdown:
  const [dietaryPreferencesList, setDietaryPreferencesList] = useState([]);  // { preference_id, preference_name }
  const [dietaryRestrictionsList, setDietaryRestrictionsList] = useState([]); // { dietary_id, dietary_name }
  const [ingredientsList, setIngredientsList] = useState([]);                 // { ingredient_id, name }

  useEffect(() => {
    // 1) Get the dietary preferences
    fetch('http://localhost:5000/api/getDietaryPreferences')
      .then(res => res.json())
      .then(data => {
        setDietaryPreferencesList(data);
      })
      .catch(error => console.error("Error fetching dietary preferences:", error));

    // 2) Get the dietary restrictions
    fetch('http://localhost:5000/api/getDietaryRestrictions')
      .then(res => res.json())
      .then(data => {
        setDietaryRestrictionsList(data); 
      })
      .catch(error => console.error("Error fetching dietary restrictions:", error));

    // 3) Get the ingredients for always available
    fetch('http://localhost:5000/api/getIngredients')
      .then(res => res.json())
      .then(data => {
        setIngredientsList(data);
      })
      .catch(error => console.error("Error fetching ingredients:", error));

  }, []);

  // Helper to update profile state for multi-select fields
  const handleMultiSelectChange = (event, newValue, field) => {
    setProfile((prev) => ({
      ...prev,
      [field]: newValue
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/saveProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Profile successfully saved:", result);
        alert("Profile saved successfully!");
      } else {
        console.error("Failed to save profile");
        alert("Error saving profile");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <>
      <LetmecookAppBar page="Profile" />
      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f4f4f4'
      }}>
        <Container maxWidth="sm" sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Student Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              />
            </Grid>

            {/** Dietary Preferences Autocomplete */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={dietaryPreferencesList}
                  // The list is { preference_id, preference_name }
                  getOptionLabel={(option) => option.preference_name}
                  // We'll store just the IDs in profile.dietaryPreferences
                  value={
                    dietaryPreferencesList.filter(p =>
                      profile.dietaryPreferences.includes(p.preference_id)
                    )
                  }
                  onChange={(event, newValue) => {
                    // newValue = array of the full objects { preference_id, preference_name }
                    const newIDs = newValue.map(obj => obj.preference_id);
                    handleMultiSelectChange(event, newIDs, "dietaryPreferences");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Dietary Preferences" />
                  )}
                />
              </FormControl>
            </Grid>

            {/** Dietary Restrictions Autocomplete */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={dietaryRestrictionsList}
                  // The list is { dietary_id, dietary_name }
                  getOptionLabel={(option) => option.dietary_name}
                  // We'll store the full objects in profile.dietaryRestrictions
                  value={profile.dietaryRestrictions}
                  onChange={(event, newValue) => {
                    handleMultiSelectChange(event, newValue, "dietaryRestrictions");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Dietary Restrictions" />
                  )}
                />
              </FormControl>
            </Grid>

            {/** Always Available Ingredients Autocomplete */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  multiple
                  options={ingredientsList}
                  // The list is { ingredient_id, name }
                  getOptionLabel={(option) => option.name}
                  // We'll store the full objects in profile.alwaysAvailable
                  value={profile.alwaysAvailable}
                  onChange={(event, newValue) => {
                    handleMultiSelectChange(event, newValue, "alwaysAvailable");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Always Available Ingredients" />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Health Goals"
                value={profile.healthGoals}
                onChange={(e) => setProfile({ ...profile, healthGoals: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Weekly Budget ($)"
                value={profile.weeklyBudget}
                onChange={(e) => setProfile({ ...profile, weeklyBudget: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Profile;
