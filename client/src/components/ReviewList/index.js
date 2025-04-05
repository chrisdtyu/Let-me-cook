import React from 'react';
import Api from './Api';
import ReviewList from './ReviewList';

const ReviewContainer = ({ recipeId }) => {
    const [reviews, setReviews] = React.useState([]);
    const [averageRating, setAverageRating] = React.useState(null);

    const getReviews = React.useCallback(async (recipe_id) => {
        try {
            const response = await Api.callApiGetReviews(recipe_id);
            const reviews = response.reviews || [];
            setReviews(reviews);
            setAverageRating(response.average_rating);
        } catch (error) {
            console.error("Error fetching review:", error);
        }
    }, []);

    React.useEffect(() => {
        getReviews(recipeId);
    }, [recipeId, getReviews]);

    return (
        <ReviewList 
            recipeId={recipeId} 
            reviews={reviews} 
            averageRating={averageRating} 
            getReviews={() => getReviews(recipeId)}
        />
    );
}

export default ReviewContainer;
