import fetch from 'node-fetch';

const Api = {
    callApiGetRecipe: async (recipeId) => {
        try {
            const response = await fetch(`/api/getRecipe?id=${recipeId}`);
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.error("Error fetching recipe:", err);
        }
    },

    callApiGetRecipeIngredients: async (recipeId, budgetMode) => {
        try {
            const response = await fetch(`/api/getRecipeIngredients?id=${recipeId}`);
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body.map(ing => ({
                ...ing,
                price: ing.price !== null ? parseFloat(ing.price) : null
            }));
        } catch (err) {
            console.error("Error fetching ingredients:", err);
            return [];
        }
    },
};

export default Api;