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
import { useNavigate } from 'react-router-dom';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const Review = ({ recipeId, reviewSubmitted }) => {
  const [enteredTitle, setEnteredTitle] = React.useState('');
  const [enteredReview, setEnteredReview] = React.useState('');
  const [selectedRating, setSelectedRating] = React.useState(0);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [enteredTitleError, setEnteredTitleError] = React.useState(false);
  const [enteredReviewError, setEnteredReviewError] = React.useState(false);
  const [selectedRatingError, setSelectedRatingError] = React.useState(false);
  const [userId, setUserId] = React.useState(null); // State to store userId
  const navigate = useNavigate(); // Hook to navigate

  // Fetch user details using firebase_uid
  React.useEffect(() => {
    const firebaseUid = localStorage.getItem('firebase_uid');
    console.log(firebaseUid)
    if (firebaseUid) {
      Api.callApiGetUser(firebaseUid)
        .then((res) => {
          console.log("API Response:", res); // Log the full response to inspect its structure
          const user = JSON.parse(res.express); // Parse the stringified JSON object
          console.log("User data:", user);

          if (user && user.user_id) {
            setUserId(user.user_id); // Set the user_id if it's found in the response
          } else {
            alert('User data not found.');
            navigate('/Login');
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          if (error.response) {
            console.error("API error response:", error.response); // Log the API error response
          } else {
            console.error("Error details:", error); // Handle other types of errors
          }
          alert('Error fetching user data. Please try again.');
        });

    } else {
      alert('No firebase UID found.');
      navigate('/Login');
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    console.log("Entered title:", enteredTitle);
    console.log("Entered review:", enteredReview);
    console.log("Selected rating:", selectedRating);
    console.log("User ID:", userId);

    let isValid = true;
    if (!enteredTitle) {
      setEnteredTitleError(true);
      isValid = false;
    } else {
      setEnteredTitleError(false);
    }
    if (!enteredReview) {
      setEnteredReviewError(true);
      isValid = false;
    } else {
      setEnteredReviewError(false);
    }
    if (!selectedRating) {
      setSelectedRatingError(true);
      isValid = false;
    } else {
      setSelectedRatingError(false);
    }

    // Only submit if everything is valid
    if (isValid && enteredTitle && enteredReview && selectedRating && userId) {
      const reviewData = {
        user_id: userId, // Send actual userId (not firebase_uid)
        recipe_id: recipeId,
        review_title: enteredTitle,
        review_score: selectedRating,
        review_content: enteredReview,
      };

      console.log("Review data being sent to API:", reviewData);

      Api.callApiAddReview(reviewData)
        .then((res) => {
          console.log('Review submitted:', res.body);
          setSubmitSuccess(true);
          setTimeout(() => {
            reviewSubmitted();
          }, 1000);
        })
        .catch((error) => {
          console.error('Error submitting review:', error);
          alert('There was an error submitting your review. Please try again later.');
        });
    }
  };

  return (
    <MainGridContainer
      container
      spacing={1}
      style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem' }}
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item xs />
      <Grid item style={{ width: 400 }}>
        <Typography variant="h5" gutterBottom component="div">
          Review This Recipe
        </Typography>

        <ReviewTitle enteredTitle={enteredTitle} handleTitleChange={(e) => setEnteredTitle(e.target.value)} />
        <ErrorMessage showError={enteredTitleError} errorMessage="Enter your review title" />

        <ReviewBody enteredReview={enteredReview} handleReviewChange={(e) => setEnteredReview(e.target.value)} />
        <ErrorMessage showError={enteredReviewError} errorMessage="Enter your review" />

        <ReviewRating selectedRating={selectedRating} handleRatingChange={(e) => setSelectedRating(e.target.value)} />
        <ErrorMessage showError={selectedRatingError} errorMessage="Select the rating" />

        <Grid item xs={12}>
          <Button id="submit-button" variant="contained" onClick={handleSubmit}>
            <b>Submit</b>
          </Button>
        </Grid>

        {submitSuccess && (
          <Grid item xs={12}>
            <Typography id="confirmation-message" variant="h6" color="#66bb6a" paddingTop={2}>
              Your review has been received!!
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid item xs />
    </MainGridContainer>
  );
};

export default Review;
