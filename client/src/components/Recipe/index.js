import React from 'react';
import Api from './Api';
import RecipeView from './RecipeView';

const Recipe = () => {
    const getRecipe = React.useCallback(async (recipe_id) => {
        try {
            // Get recipe information
            const recipe = await Api.callApiGetRecipe(recipe_id);
            setRecipe(recipe);
            // Get recipe ingredients
            let ingredients = await Api.callApiGetRecipeIngredients(recipe_id);
            // Append "*" to required ingredients
            ingredients = ingredients.map(ingredient => ({
                ...ingredient,
                name: ingredient.required === 1 ? `${ingredient.name} *` : ingredient.name
            }));
            setIngredients(ingredients);
        } catch (error) {
            console.error("Error fetching recipe:", error);
        }
    }, []);

    const [recipe, setRecipe] = React.useState({});
    const [ingredients, setIngredients] = React.useState([]);

    return (
        <RecipeView getRecipe={getRecipe} recipe={recipe} ingredients={ingredients} />
    )
}


export default Recipe;
