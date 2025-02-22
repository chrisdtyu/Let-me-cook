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

    callApiGetRecipeIngredients: async (recipeId) => {
        try {
            const response = await fetch(`/api/getRecipeIngredients?id=${recipeId}`);
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.error("Error fetching ingredients:", err);
        }
    },
};

export default Api;