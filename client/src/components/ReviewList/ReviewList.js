import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Review from '../Review';
import Api from './Api';

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const ReviewList = ({ recipeId, reviews, averageRating, getReviews }) => {
  const [showReview, setShowReview] = React.useState(false);

  const toggleReview = () => {
    setShowReview(!showReview);
  };

  return (
    <MainGridContainer
      container
      spacing={2}
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
      direction="column"
      alignItems="center"
    >
      <Typography variant="h4" gutterBottom>
        <b>Reviews</b> {(!reviews || reviews.length === 0) && "- No reviews yet"}
      </Typography>

      <Typography variant="h6" gutterBottom>
        <b>Average Rating: </b>{averageRating ? `⭐ ${averageRating.toFixed(1)}` : "N/A"}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 2, px: 4, py: 1.5, fontSize: "1rem", borderRadius: "8px" }}
        onClick={toggleReview}
      >
        {showReview ? "Cancel Review" : "Leave a Review"}
      </Button>

      {showReview && 
        <Review recipeId={recipeId} reviewSubmitted={toggleReview} />
      }

      <Grid container spacing={2} justifyContent="center">
        {reviews?.map((item, index) => (
          <Grid item xs={12} sm={8} key={index}>
            <Item item={item} />
          </Grid>
        ))}
      </Grid>
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
