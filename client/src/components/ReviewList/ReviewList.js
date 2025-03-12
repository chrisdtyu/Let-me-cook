import * as React from 'react';
import Api from './Api';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Review from '../Review'

const MainGridContainer = styled(Grid)(({ theme }) => ({
  margin: theme.spacing(4),
}));

const userId = 1;

const ReviewList = ({ recipeId, getReviews, reviews }) => {

  React.useEffect(() => {
    getReviews(recipeId);
  }, [recipeId, getReviews]);

  const [showReview, setShowReview] = React.useState(false);

  const toggleReview = () => {
    setShowReview(!showReview);
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
      <Grid item xs />
      <Grid item style={{ width: 400 }}>
        <Grid item xs={12}>
          <Typography variant="h3" gutterBottom component="div">
            <b>Reviews: </b> {!reviews && "no reviews yet"}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 4, px: 4, py: 2, fontSize: "1rem", borderRadius: "8px" }}
            onClick={toggleReview}
          >
            {showReview? "Cancel Review": "Leave a Review"}
          </Button>
        </Grid>
        {showReview && 
          <Review recipeId={recipeId} reviewSubmitted={toggleReview}/>       
        }
        <List reviewList={reviews} />
      </Grid>
      <Grid item xs />
    </MainGridContainer>
  );
}

const List = ({ reviewList }) => {
  return (
    <>
      {reviewList &&
        reviewList.map((item) => {
          return (
            <Grid item xs={4}>
              <Item
                item={item}
              />
            </Grid>
          );
        })}
    </>
  )
}

const Item = ({ item }) => {
  return (
    <Box sx={{
      paddingLeft: 10, paddingRight: 10,
      border: '2px #39080c',
      height: "100%",
      borderRadius: 2,
      backgroundColor: "#d1d0ce",
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <Grid container direction="column" sx={{
        p: 1,
        border: '2px #39080c',
        height: "100%",
        borderRadius: 2,
        color: "#000000"
      }}>
        <Typography variant="h8" paddingTop={2}>
          <b>Review Title:</b> {item.review_title}
        </Typography>
        <Typography variant="h8">
          <b>Rating:</b> {item.review_score}
        </Typography>
        <Typography variant="h8">
          <b>Review Content: </b> {item.review_content}
        </Typography>
        <Typography variant="h8">
          <b>Created by: </b> {item.first_name} {item.last_name}
        </Typography>
      </Grid>
    </Box>
  )
}

export default ReviewList;