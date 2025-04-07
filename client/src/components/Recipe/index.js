import React from 'react';
import { useParams } from 'react-router-dom'; // for dynamic route
import Api from './Api';
import RecipeView from './RecipeView';

const Recipe = () => {
    const { recipe_id } = useParams(); // assumes your route is like /recipe/:recipe_id

    const [recipe, setRecipe] = React.useState({});
    const [ingredients, setIngredients] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const getRecipe = React.useCallback(async (id) => {
        if (!id) {
            console.warn("No recipe_id provided to getRecipe");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const recipeData = await Api.callApiGetRecipe(id);
            setRecipe(recipeData);

            let ingredientData = await Api.callApiGetRecipeIngredients(id);
            ingredientData = ingredientData.map(ingredient => ({
                ...ingredient,
                name: ingredient.required === 1 ? `${ingredient.name} *` : ingredient.name
            }));
            setIngredients(ingredientData);
        } catch (err) {
            console.error("Error fetching recipe:", err);
            setError("Failed to load recipe. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch when recipe_id is in URL
    React.useEffect(() => {
        if (recipe_id) getRecipe(recipe_id);
    }, [recipe_id, getRecipe]);

    return (
        <RecipeView
            getRecipe={getRecipe}
            recipe={recipe}
            ingredients={ingredients}
            loading={loading}
            error={error}
        />
    );
};

export default Recipe;
