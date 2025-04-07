import React from 'react';
import {
  Grid, TextField, Button, Typography, Box, FormControl
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../Budget/BudgetContext';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

// memoized child component with React.memo
const TriedRecipesList = React.memo(function TriedRecipesList({ recipes, onNavigate }) {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        Tried Recipes
      </Typography>
      {recipes.length === 0 ? (
        <Typography>No tried recipes yet.</Typography>
      ) : (
        recipes.map((r) => (
          <Box key={r.recipe_id} sx={{ marginBottom: 1 }}>
            <Typography
              sx={{ textDecoration: 'underline', cursor: 'pointer', color: '#39244F' }}
              onClick={() => onNavigate(r.recipe_id)}
            >
              {r.name}
            </Typography>
          </Box>
        ))
      )}
    </>
  );
});

// memoized child component with React.memo
const FavouriteRecipesList = React.memo(function FavouriteRecipesList({ recipes }) {
  return (
    <>
      <Typography variant="h5" sx={{ mt: 3 }}>
        Favourite Recipes
      </Typography>
      {recipes.length === 0 ? (
        <Typography>No favourite recipes yet.</Typography>
      ) : (
        recipes.map((r) => (
          <Box key={r.recipe_id} sx={{ marginBottom: 1 }}>
            <a
              href={'/Recipe/' + r.recipe_id}
              style={{ textDecoration: 'underline', cursor: 'pointer', color: '#39244F' }}
            >
              {r.name}
            </a>
          </Box>
        ))
      )}
    </>
  );
});

const Profile = () => {
  const navigate = useNavigate();
  const { weeklySpent } = useBudget();

  const [profile, setProfile] = React.useState({
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

  const [dietaryPreferencesList, setDietaryPreferencesList] = React.useState([]);
  const [dietaryRestrictionsList, setDietaryRestrictionsList] = React.useState([]);
  const [ingredientsList, setIngredientsList] = React.useState([]);
  const [goalsList, setGoalsList] = React.useState([]);

  const [triedRecipes, setTriedRecipes] = React.useState([]);
  const [favRecipes, setFavRecipes] = React.useState([]);

  // For controlling field errors
  const [didSubmitErrors, setDidSubmitErrors] = React.useState([]);

  React.useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    if (!firebaseUid) {
      alert('You must log in first!');
      navigate('/Login');
      return;
    }

    // get user
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
          // get user recipes
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

    // get user profile
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
          const {
            user,
            dietaryPreferences,
            dietaryRestrictions,
            alwaysAvailable,
            healthGoals
          } = data;

          const weeklyBudgetVal = localStorage.getItem('weeklySpent') === '0'
            ? ''
            : user.weekly_budget || '';

          // ensure we have at least one blank row if none exist
          // plus we track whether items are from DB (loadedFromDB=true) or newly added
          const finalAlways = (alwaysAvailable && alwaysAvailable.length > 0)
            ? alwaysAvailable.map(item => ({
                ...item,
                // If there's an ingredient_name from server, we consider it loaded from DB
                loadedFromDB: !!item.ingredient_name
              }))
            : [{ ingredient_name: '', loadedFromDB: false }];

          setProfile((prev) => ({
            ...prev,
            weeklyBudget: weeklyBudgetVal,
            dietaryPreferences: dietaryPreferences || [],
            dietaryRestrictions: dietaryRestrictions || [],
            alwaysAvailable: finalAlways,
            healthGoals: healthGoals || [],
          }));
          setDidSubmitErrors(finalAlways.map(() => false));
        }
      })
      .catch((err) => console.error('Error fetching full user profile:', err));

    // fetch lists
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

  const selectedPreferenceObjects = React.useMemo(() => {
    return dietaryPreferencesList.filter((p) =>
      profile.dietaryPreferences.includes(p.preference_id)
    );
  }, [dietaryPreferencesList, profile.dietaryPreferences]);

  const selectedRestrictionObjects = React.useMemo(() => {
    return dietaryRestrictionsList.filter((dr) =>
      profile.dietaryRestrictions.some((sel) => sel.dietary_id === dr.dietary_id)
    );
  }, [dietaryRestrictionsList, profile.dietaryRestrictions]);

  const selectedGoalObjects = React.useMemo(() => {
    return goalsList.filter((g) =>
      profile.healthGoals.includes(g.goal_id)
    );
  }, [goalsList, profile.healthGoals]);

  const handleSubmit = async () => {
    // track errors
    const ingredientErrors = profile.alwaysAvailable.map(item => !item.ingredient_name);
    setDidSubmitErrors(ingredientErrors);

    // check for duplicates
    const allNames = profile.alwaysAvailable
      .map(item => item.ingredient_name.trim().toLowerCase())
      .filter(n => n);
    const hasDuplicate = allNames.length !== new Set(allNames).size;
    if (hasDuplicate) {
      alert('You have duplicate ingredients. Please remove duplicates before updating your profile.');
      return;
    }

    // check for missing required fields
    if (ingredientErrors.some(e => e)) {
      alert('Please fill out all required ingredient fields before submitting.');
      return;
    }

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

        setProfile(prev => {
          const updatedAvail = prev.alwaysAvailable.map(item => ({
            ...item,
            loadedFromDB: !!item.ingredient_name
          }));
          return { ...prev, alwaysAvailable: updatedAvail };
        });

      } else {
        console.error('Failed to save profile');
        alert('Error saving profile');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Please try again later.');
    }
  };

  const handleNavigate = React.useCallback(
    (recipeId) => {
      navigate('/Recipe/' + recipeId);
    },
    [navigate]
  );

  return (
    <>
      <LetmecookAppBar page="Profile" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100vh',
          backgroundColor: '#fffbf0',
          paddingTop: 4,
        }}
      >
        <Grid container spacing={2} sx={{ width: '90%', maxWidth: 1200 }}>
          {/* left column */}
          <Grid item xs={12} md={8}>
            <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h4" textAlign="center" gutterBottom>
                User Profile
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

                {/* Always Available Ingredients */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Always Available Ingredients
                  </Typography>

                  {profile.alwaysAvailable.map((item, idx) => {
                    const matchedIng = ingredientsList.find(
                      ing => ing.name === item.ingredient_name
                    ) || null;
                    const showError = didSubmitErrors[idx];

                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          alignItems: 'center',
                          mb: 1,
                          flexWrap: 'wrap'
                        }}
                      >
                        <Autocomplete
                          options={ingredientsList}
                          getOptionLabel={(option) => option.name}
                          value={matchedIng}
                          onChange={(event, newVal) => {
                            const updated = [...profile.alwaysAvailable];
                            updated[idx].ingredient_name = newVal ? newVal.name : '';
                            const updatedErrors = [...didSubmitErrors];
                            updatedErrors[idx] = !newVal;
                            setDidSubmitErrors(updatedErrors);
                            setProfile({ ...profile, alwaysAvailable: updated });
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Ingredient"
                              required
                              error={showError}
                              helperText={showError ? "Please fill out this field" : ""}
                            />
                          )}
                          sx={{ width: 220 }}
                        />

                        {/* Expiration Date + "Expiring soon" */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <TextField
                            label="Expiration Date"
                            type="date"
                            value={item.expirationDate || ''}
                            onChange={(e) => {
                              const updated = [...profile.alwaysAvailable];
                              updated[idx].expirationDate = e.target.value;
                              updated[idx].loadedFromDB = false;
                              setProfile({ ...profile, alwaysAvailable: updated });
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 180 }}
                          />

                          {item.loadedFromDB && item.expirationDate && (() => {
                            const expiryDate = new Date(item.expirationDate);
                            const now = new Date();
                            const diffDays = (expiryDate - now) / (1000 * 3600 * 24);
                            // show "Expiring soon" if within 7 days
                            if (diffDays <= 7 && diffDays >= 0) {
                              return (
                                <Typography variant="caption" color="error" sx={{ mt: '2px' }}>
                                  Expiring soon
                                </Typography>
                              );
                            }
                            return null;
                          })()}
                        </Box>

                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            const updated = [...profile.alwaysAvailable];
                            updated.splice(idx, 1);
                            setProfile({ ...profile, alwaysAvailable: updated });

                            const updatedErrors = [...didSubmitErrors];
                            updatedErrors.splice(idx, 1);
                            setDidSubmitErrors(updatedErrors);
                          }}
                        >
                          DELETE
                        </Button>
                      </Box>
                    );
                  })}

                  <Button
                    variant="contained"
                    onClick={() => {
                      setProfile({
                        ...profile,
                        alwaysAvailable: [
                          ...profile.alwaysAvailable,
                          { ingredient_name: '', loadedFromDB: false }
                        ],
                      });
                      setDidSubmitErrors([...didSubmitErrors, false]);
                    }}
                  >
                    ADD INGREDIENT
                  </Button>
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
              <TriedRecipesList recipes={triedRecipes} onNavigate={handleNavigate} />
              <FavouriteRecipesList recipes={favRecipes} />
            </Box>

            <Box sx={{ mt: 4, borderRadius: 2, backgroundColor: 'white', p: 3, boxShadow: 3 }}>
              <Typography variant="h6">Weekly Budget Tracker</Typography>
              <Typography variant="body1">
                Total Spent This Week: ${weeklySpent}
              </Typography>

              {profile.weeklyBudget && weeklySpent > profile.weeklyBudget && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  You are over your weekly budget!
                </Typography>
              )}

              {profile.weeklyBudget && weeklySpent > profile.weeklyBudget * 0.8 && weeklySpent <= profile.weeklyBudget && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  You're nearing your weekly budget.
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Profile;