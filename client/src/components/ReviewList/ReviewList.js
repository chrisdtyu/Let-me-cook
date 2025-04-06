import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import Review from '../ReviewForm';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const ReviewList = ({ recipeId, reviews, averageRating, getReviews }) => {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [showReviews, setShowReviews] = React.useState(false);

  // Open Review Dialog
  const handleReviewDialogOpen = () => {
    setIsReviewDialogOpen(true);
  };

  // Close Review Dialog
  const handleReviewDialogClose = () => {
    setIsReviewDialogOpen(false);

    // Return a promise that waits for reviews to be fetched
    new Promise((resolve, reject) => {
      getReviews(recipeId)  // Pass the recipeId to fetch reviews
        .then(() => resolve())  // Resolves once the reviews are updated
        .catch((error) => reject(error));  // Reject if error occurs
    })
    .then(() => {
      // Handle further actions after reviews have been updated
      console.log("Reviews have been successfully updated.");
    })
    .catch((error) => {
      console.error("Failed to fetch reviews:", error);
    });
  };

  return (
    <MainGridContainer
      container
      spacing={2}
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
      direction="column"
      alignItems="center"
    >
      <Typography variant="h6" gutterBottom>
        <b>Average Rating: </b>{averageRating ? `⭐ ${averageRating.toFixed(1)}` : "N/A"}
      </Typography>

      {/* Leave a Review Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2, px: 4, py: 1.5, fontSize: "1rem", borderRadius: "8px" }}
        onClick={handleReviewDialogOpen}
      >
        Leave a Review
      </Button>

      {/* Toggle Show Reviews */}
      {reviews?.length > 0 && (
        <Typography
          onClick={() => setShowReviews(prev => !prev)}
          sx={{ cursor: 'pointer', mb: 2, textDecoration: 'underline', textTransform: 'none', fontWeight: 500 }}
        >
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </Typography>
      )}

      {/* Dialog for Review */}
      <Dialog open={isReviewDialogOpen} onClose={handleReviewDialogClose}>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <Review recipeId={recipeId} reviewSubmitted={handleReviewDialogClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReviewDialogClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Display Reviews */}
      {showReviews && ( 
        <Grid container spacing={2} justifyContent="center">
          {reviews?.map((item, index) => (
            <Grid item xs={12} sm={8} key={index}>
              <Item item={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </MainGridContainer>
  );
};


const Item = ({ item }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        border: "1px solid #ddd",
      }}
    >
      <Box sx={{ textAlign: "center", width: "100%" }}>
        <Typography variant="h6" paddingTop={2}>
          <b>Review Title:</b> {item.review_title}
        </Typography>
      </Box>
      <Typography variant="body1">
        <b>Rating:</b> {"⭐".repeat(item.review_score)}
      </Typography>
      <Typography variant="body2"><b>Review Comments:</b></Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line", ml: 2 }}>
        {item.review_content}
      </Typography>
      <Typography variant="caption">
        <b>By:</b> {item.first_name} {item.last_name}
      </Typography>
    </Box>
  );
};

export default ReviewList;
