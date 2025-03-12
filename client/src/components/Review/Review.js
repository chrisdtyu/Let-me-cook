import * as React from 'react';
import Api from './Api';
import ReviewTitle from './ReviewTitle';
import ReviewBody from './ReviewBody';
import ReviewRating from './ReviewRating';
import ErrorMessage from './ErrorMessage';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const userId = 1;

const Review = ({recipeId, reviewSubmitted}) => {

  // // Declaring states and handle functions for states

  // Review Title
  const [enteredTitle, setEnteredTitle] = React.useState();
  const handleTitleChange = (event) => {
    setEnteredTitle(event.target.value);
    setEnteredTitleError(false);
  }
  const [enteredTitleError, setEnteredTitleError] = React.useState(false);

  // Review Content
  const [enteredReview, setEnteredReview] = React.useState();
  const handleReviewChange = (event) => {
    setEnteredReview(event.target.value);
    setEnteredReviewError(false);
  }
  const [enteredReviewError, setEnteredReviewError] = React.useState(false);

  // Review Rating
  const [selectedRating, setSelectedRating] = React.useState(0);
  const handleRatingChange = (event) => {
    setSelectedRating(event.target.value);
    setSelectedRatingError(false);
  }
  const [selectedRatingError, setSelectedRatingError] = React.useState(false);

  // State and handle function for submit button
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleSubmit = (event) => {
      if(!enteredTitle){
        setEnteredTitleError(true);
      }
      else{
        setEnteredTitleError(false);      
      }
      if(!enteredReview){
        setEnteredReviewError(true);
      }
      else{
        setEnteredReviewError(false);
      }
      if(!selectedRating){
        setSelectedRatingError(true);
      }
      else{
        setSelectedRatingError(false);
      }
      if(enteredTitle && enteredReview && selectedRating){
        const reviewData = { 
          user_id: userId,
          recipe_id: recipeId,
          review_title: enteredTitle, 
          review_score:selectedRating,
          review_content: enteredReview
        };
        Api.callApiAddReview(reviewData)
          .then(res => {
            console.log("callApiAddReview returned: ", res.body, reviewData);
            setSubmitSuccess(true);
            setTimeout(() => {
              reviewSubmitted();
            }, 1000);
          });
      }
  }

  return (
    <MainGridContainer
      container
      spacing={1}
      style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem' }}
      direction="row"
      justifyContent="center"
      alignItems="center"    
    > 
      <Grid item xs/>
      <Grid item style={{width: 400}}>
        <Grid item xs={12}>
          <Typography variant="h3" gutterBottom component="div">
            Review This Recipe
          </Typography>
        </Grid>
        <ReviewTitle enteredTitle={enteredTitle} handleTitleChange={handleTitleChange}/>
        <ErrorMessage showError={enteredTitleError} errorMessage="Enter your review title"/>
        <ReviewBody enteredReview={enteredReview} handleReviewChange={handleReviewChange}/>
        <ErrorMessage showError={enteredReviewError} errorMessage="Enter your review"/>
        <ReviewRating selectedRating={selectedRating} handleRatingChange={handleRatingChange}/>
        <ErrorMessage showError={selectedRatingError} errorMessage="Select the rating"/>
        <Grid item xs={12}>
          <Button
            id="submit-button"
            variant="contained"
            onClick={handleSubmit}
          >
            <b>Submit</b>
          </Button>
        </Grid> 
        {submitSuccess &&
        <Grid item xs={12}>
        <Typography id="confirmation-message" variant="h6" color="#66bb6a" paddingTop={2}>
            Your review has been received!!
        </Typography>
        </Grid>
        }    
      </Grid> 
      <Grid item xs/> 
    </MainGridContainer>
  );
}

export default Review;