import React from 'react';
import Api from './Api';
import ReviewList from './ReviewList';

const Review = ({recipeId}) => {
    const getReviews = React.useCallback(async (recipe_id) => {
        try {
            // Get review information
            const reviews = await Api.callApiGetReviews(recipe_id);
            setReviews(reviews);
        } catch (error) {
            console.error("Error fetching review:", error);
        }
    }, []);

    const [reviews, setReviews] = React.useState([]);

    return (
        <ReviewList getReviews={getReviews} reviews={reviews} recipeId={recipeId}/>
    )
}

export default Review;
