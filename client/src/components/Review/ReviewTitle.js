import * as React from 'react';
//import all necessary libraries here, e.g., Material-UI Typography, as follows
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

const ReviewTitle = (props) => {

  return (
    <Grid item xs={12} paddingTop={2}>
      <InputLabel id="review-title-label">Enter a review</InputLabel>
      <TextField
        id="review-title"
        labelId="review-title-label"
        style = {{width: 400}}
        value={props.enteredTitle}
        label = "Review Title"
        onChange={props.handleTitleChange}
      />
    </Grid>
  );
}

export default ReviewTitle;