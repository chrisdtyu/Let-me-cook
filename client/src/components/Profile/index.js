import React, { useState } from 'react';
import { 
    Grid, TextField, MenuItem, Button, Typography, Box, Container, Select, InputLabel, FormControl, Chip 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LetmecookAppBar from '../AppBar';

const MainGridContainer = styled(Grid)(({ theme }) => ({
    margin: theme.spacing(4),
}));

const dietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "High-Protein", "Low-Carb", "None"];
const allergyOptions = ["Allergy 1", "Allergy 2", "Allergy 3", "Allergy 4"]; // Example list

const Profile = () => {
    const [profile, setProfile] = useState({
        name: "",
        email: "", 
        age: "",
        dietaryPreferences: [], 
        allergies: [],
        healthGoals: "",
        weeklyBudget: "" 
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === "age") {
            const ageValue = value === "" ? "" : Math.max(1, Math.min(99, Number(value))); 
            setProfile({ ...profile, age: ageValue });
        } else if (name === "weeklyBudget") {
            const budgetValue = value === "" ? "" : Math.max(0, Number(value)); 
            setProfile({ ...profile, weeklyBudget: budgetValue });
        } else {
            setProfile({ ...profile, [name]: value });
        }
    };

    const handleMultiSelectChange = (event) => {
        setProfile({ ...profile, [event.target.name]: event.target.value });
    };

    const handleSubmit = async () => {// not working yet
        try {
            const response = await fetch('http://localhost:5000/api/saveProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f4f4f4',
                }}
            >
                <Container maxWidth="sm" sx={{ backgroundColor: 'white', p: 4, borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom>
                        Student Profile
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Name" 
                                name="name"
                                value={profile.name} 
                                onChange={handleChange} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Email" 
                                name="email"
                                value={profile.email} 
                                onChange={handleChange} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                type="number"
                                label="Age" 
                                name="age"
                                value={profile.age} 
                                onChange={handleChange} 
                                inputProps={{ min: 1, max: 99 }}
                                onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()} // prevent negative & scientific notation
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Dietary Preferences</InputLabel>
                                <Select
                                    multiple
                                    name="dietaryPreferences"
                                    value={profile.dietaryPreferences}
                                    onChange={handleMultiSelectChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {dietaryOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Allergies</InputLabel>
                                <Select
                                    multiple
                                    name="allergies"
                                    value={profile.allergies}
                                    onChange={handleMultiSelectChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {allergyOptions.map((allergy) => (
                                        <MenuItem key={allergy} value={allergy}>
                                            {allergy}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Health Goals"
                                name="healthGoals"
                                value={profile.healthGoals} 
                                onChange={handleChange} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                type="number"
                                label="Weekly Budget ($)" 
                                name="weeklyBudget"
                                value={profile.weeklyBudget} 
                                onChange={handleChange}
                                inputProps={{ min: 0 }} 
                                onKeyDown={(e) => (e.key === '-' || e.key === 'e') && e.preventDefault()} // prevent negative & scientific notation
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
