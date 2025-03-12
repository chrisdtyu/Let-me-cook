import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Button, Typography, Box, Container, FormControl
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
    // These arrays store the “raw” bridging data:
    // dietaryPreferences: [ 2, 3 ], for example
    dietaryPreferences: [],
    // dietaryRestrictions: [ { dietary_id: 1 }, { dietary_id: 5 } ], etc.
    dietaryRestrictions: [],
    // alwaysAvailable: [ { ingredient_id: 10 }, ... ]
    alwaysAvailable: [],
    healthGoals: '',
    weeklyBudget: '',
  });

  // Full lists from DB
  const [dietaryPreferencesList, setDietaryPreferencesList] = useState([]);
  const [dietaryRestrictionsList, setDietaryRestrictionsList] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);

  useEffect(() => {
    // check if user is logged in
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (!firebaseUid) {
      alert('You must log in first!');
      navigate('/Login');
      return;
    }

    // 1) fetch user for read-only name/email
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
      })
      .catch((err) => console.error('Error fetching user:', err));

    // 2) fetch bridging data so we can auto-populate dietary stuff
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
            healthGoals: data.user.health_goals || '',
            weeklyBudget: data.user.weekly_budget || '',
            dietaryPreferences: data.dietaryPreferences || [],
            dietaryRestrictions: data.dietaryRestrictions || [],
            alwaysAvailable: data.alwaysAvailable || [],
          }));
        }
      })
      .catch((err) => console.error('Error fetching full user profile:', err));

    // 3) fetch the full lists
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
  }, [navigate]);

  // We store the raw bridging data in profile, but
  // the Autocomplete’s "value" must be a list of *full objects* from the DB for the label to display
  const selectedPreferenceObjects = dietaryPreferencesList.filter((p) =>
    profile.dietaryPreferences.includes(p.preference_id)
  );

  const selectedRestrictionObjects = dietaryRestrictionsList.filter((dr) =>
    profile.dietaryRestrictions.some((sel) => sel.dietary_id === dr.dietary_id)
  );

  const selectedIngredientObjects = ingredientsList.filter((ing) =>
    profile.alwaysAvailable.some((sel) => sel.ingredient_id === ing.ingredient_id)
  );

  const handleMultiSelectChange = (event, newValue, field) => {
    setProfile((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

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
          alignItems: 'center',
          height: '100vh', 
          backgroundColor: '#f4f4f4'
        }}
      >
        <Container maxWidth="sm" sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h4" textAlign="center" gutterBottom>
            Student Profile
          </Typography>
          <Grid container spacing={2}>
            {/* read-only name/email */}
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
                  // Show the fully matched objects as "value"
                  value={selectedPreferenceObjects}
                  onChange={(event, newValue) => {
                    // newValue is array of full objects
                    // convert to array of preference_id
                    const newIDs = newValue.map((obj) => obj.preference_id);
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
                  // We filter the fully matched objects for the "value"
                  value={selectedRestrictionObjects}
                  onChange={(event, newValue) => {
                    // newValue is array of objects with { dietary_id, dietary_name }
                    // store them as { dietary_id } in our profile
                    const arr = newValue.map(obj => ({ dietary_id: obj.dietary_id }));
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
                    // store them as { ingredient_id }
                    const arr = newValue.map(obj => ({ ingredient_id: obj.ingredient_id }));
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

            {/* health goals */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Health Goals"
                value={profile.healthGoals}
                onChange={(e) => setProfile({ ...profile, healthGoals: e.target.value })}
              />
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
        </Container>
      </Box>
    </>
  );
};

export default Profile;
