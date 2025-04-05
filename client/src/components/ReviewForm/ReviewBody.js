import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

const ReviewBody = (props) => {

  return (
    <Grid item xs={12} paddingTop={2}>
      <TextField
        id="review-body"
        value={props.enteredReview}
        label="Review"
        style = {{width: 400}}
        multiline
        rows={4}
        inputProps={{ maxLength: 200 }}
        onChange={props.handleReviewChange}
      />
    </Grid>
  );
}

export default ReviewBody;