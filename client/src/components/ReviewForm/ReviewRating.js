import * as React from 'react';
//import all necessary libraries here, e.g., Material-UI Typography, as follows
import RadioGroup from '@mui/material/RadioGroup';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Grid from '@mui/material/Grid';

const ReviewRating = (props) => {

  return (
    <Grid item xs={12}>
      <InputLabel id="review-rating-label"> Select a Rating</InputLabel>
      <RadioGroup
        labelId="review-rating-label"
        id="review-rating"
        row
        name="radio-buttons-group"
        value={props.selectedRating}
        onChange={props.handleRatingChange}
        sx = {{justifyContent:"center"}}
      >
        <FormControlLabel value={1} control={<Radio />} label="1" />
        <FormControlLabel value={2} control={<Radio />} label="2" />
        <FormControlLabel value={3} control={<Radio />} label="3" />
        <FormControlLabel value={4} control={<Radio />} label="4" />
        <FormControlLabel value={5} control={<Radio />} label="5" />
      </RadioGroup>
    </Grid>
  );
}

export default ReviewRating;