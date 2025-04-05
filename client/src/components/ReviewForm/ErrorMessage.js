import * as React from 'react';
//import all necessary libraries here, e.g., Material-UI Typography, as follows
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const ErrorMessage = (props) => {

    return (
    <>
      {props.showError ?
        <Grid item xs={12}>
        <Typography variant="body2" color="red">
            {props.errorMessage}
        </Typography>        
        </Grid>
      : ""
      }
    </>
  );
}

export default ErrorMessage;