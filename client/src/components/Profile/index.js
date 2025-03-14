import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Button, Typography, Box, FormControl
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';
import { useNavigate } from 'react-router-dom';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));
 
const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firebase_uid: '',
    firstName: '',
    lastName: '',
    email: '',
    dietaryPreferences: [],  
    dietaryRestrictions: [], 
    alwaysAvailable: [],     
    healthGoals: [],         
    weeklyBudget: '',
  });

  const [dietaryPreferencesList, setDietaryPreferencesList] = useState([]);
  const [dietaryRestrictionsList, setDietaryRestrictionsList] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [goalsList, setGoalsList] = useState([]);

  const [triedRecipes, setTriedRecipes] = useState([]);
  const [favRecipes, setFavRecipes] = useState([]);

  useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (!firebaseUid) {
      alert('You must log in first!');
      navigate('/Login');
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
        }
        setProfile((prev) => ({
          ...prev,
          firebase_uid: firebaseUid,
          firstName: parsed.first_name || '',
          lastName: parsed.last_name || '',
          email: parsed.email || '',
        }));

        if (parsed && parsed.user_id) {
          fetch('/api/getUserRecipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: parsed.user_id }),
          })
            .then(r => r.json())
            .then((info) => {
              setTriedRecipes(info.tried || []);
              setFavRecipes(info.favourites || []);
            })
            .catch((err) => console.error('Error fetching user tried/favourites:', err));
        }
      })
      .catch((err) => console.error('Error fetching user:', err));


    fetch('/api/getUserProfile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebase_uid: firebaseUid }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch full profile');
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setProfile((prev) => ({
            ...prev,
            weeklyBudget: data.user.weekly_budget || '',
            dietaryPreferences: data.dietaryPreferences || [],
            dietaryRestrictions: data.dietaryRestrictions || [],
            alwaysAvailable: data.alwaysAvailable || [],
            healthGoals: data.healthGoals || [],
          }));
        }
      })
      .catch((err) => console.error('Error fetching full user profile:', err));


    fetch('/api/getDietaryPreferences')
      .then((res) => res.json())
      .then((data) => setDietaryPreferencesList(data))
      .catch((error) => console.error('Error fetching dietary preferences:', error));

    fetch('/api/getDietaryRestrictions')
      .then((res) => res.json())
      .then((data) => setDietaryRestrictionsList(data))
      .catch((error) => console.error('Error fetching dietary restrictions:', error));

    fetch('/api/getIngredients')
      .then((res) => res.json())
      .then((data) => setIngredientsList(data))
      .catch((error) => console.error('Error fetching ingredients:', error));

    fetch('/api/getHealthGoals')
      .then((res) => res.json())
      .then((data) => setGoalsList(data))
      .catch((err) => console.error('Error fetching health goals:', err));

  }, [navigate]);

  const selectedPreferenceObjects = dietaryPreferencesList.filter((p) =>
    profile.dietaryPreferences.includes(p.preference_id)
  );
  const selectedRestrictionObjects = dietaryRestrictionsList.filter((dr) =>
    profile.dietaryRestrictions.some((sel) => sel.dietary_id === dr.dietary_id)
  );
  const selectedIngredientObjects = ingredientsList.filter((ing) =>
    profile.alwaysAvailable.some((sel) => sel.ingredient_id === ing.ingredient_id)
  );
  const selectedGoalObjects = goalsList.filter((g) =>
    profile.healthGoals.includes(g.goal_id)
  );

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/saveProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Profile saved:', result);
        alert('Profile updated successfully!');
      } else {
        console.error('Failed to save profile');
        alert('Error saving profile');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <>
      <LetmecookAppBar page="Profile" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100vh',
          backgroundColor: '#f4f4f4',
          paddingTop: 4,
        }}
      >
        <Grid container spacing={2} sx={{ width: '90%', maxWidth: 1200 }}>
          {/* left column */}
          <Grid item xs={12} md={8}>
            <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h4" textAlign="center" gutterBottom>
                Student Profile
              </Typography>

              <Grid container spacing={2}>
                {/* name/email */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profile.firstName}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profile.lastName}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>

                {/* dietary preferences */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Autocomplete
                      multiple
                      options={dietaryPreferencesList}
                      getOptionLabel={(option) => option.preference_name}
                      value={selectedPreferenceObjects}
                      onChange={(event, newValue) => {
                        const newIDs = newValue.map(obj => obj.preference_id);
                        setProfile((prev) => ({
                          ...prev,
                          dietaryPreferences: newIDs,
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Dietary Preferences" />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* dietary restrictions */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Autocomplete
                      multiple
                      options={dietaryRestrictionsList}
                      getOptionLabel={(option) => option.dietary_name}
                      value={selectedRestrictionObjects}
                      onChange={(event, newValue) => {
                        const arr = newValue.map(r => ({ dietary_id: r.dietary_id }));
                        setProfile((prev) => ({
                          ...prev,
                          dietaryRestrictions: arr,
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Dietary Restrictions" />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* alwaysAvailable */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Autocomplete
                      multiple
                      options={ingredientsList}
                      getOptionLabel={(option) => option.name}
                      value={selectedIngredientObjects}
                      onChange={(event, newValue) => {
                        const arr = newValue.map(i => ({ ingredient_id: i.ingredient_id }));
                        setProfile((prev) => ({
                          ...prev,
                          alwaysAvailable: arr,
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Always Available Ingredients" />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* healthGoals */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <Autocomplete
                      multiple
                      options={goalsList}
                      getOptionLabel={(option) => option.goal_name}
                      value={selectedGoalObjects}
                      onChange={(event, newValue) => {
                        const newIDs = newValue.map(obj => obj.goal_id);
                        setProfile((prev) => ({
                          ...prev,
                          healthGoals: newIDs,
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Health Goals" />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* weeklyBudget */}
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

                {/* Update Button */}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* right column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h5" gutterBottom>
                Tried Recipes
              </Typography>
              {triedRecipes.length === 0 ? (
                <Typography>No tried recipes yet.</Typography>
              ) : (
                triedRecipes.map((r) => (
                  <Box key={r.recipe_id} sx={{ marginBottom: 1 }}>
                    <Typography
                      sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'blue' }}
                      onClick={() => navigate('/Recipe/' + r.recipe_id)}
                    >
                      {r.name}
                    </Typography>
                  </Box>
                ))
              )}

              <Typography variant="h5" sx={{ mt: 3 }}>
                Favourite Recipes
              </Typography>
              {favRecipes.length === 0 ? (
                <Typography>No favourite recipes yet.</Typography>
              ) : (
                favRecipes.map((r) => (
                  <Box key={r.recipe_id} sx={{ marginBottom: 1 }}>
                    <Typography
                      sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'blue' }}
                      onClick={() => navigate('/Recipe/' + r.recipe_id)}
                    >
                      {r.name}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Grid>

        </Grid>
      </Box>
    </>
  );
};

export default Profile;
