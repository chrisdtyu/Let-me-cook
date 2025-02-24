const Api = {
    callApiGetRecipes: async () => {
        try {
            const response = await fetch('/api/getRecipes');
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (err) {
            console.error("Error fetching recipes:", err);
            return [];
        }
    },

    callApiRecommendRecipes: async (ingredients, budgetMode) => {
        try {
            const response = await fetch('/api/recommendRecipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, budgetMode })
            });
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (err) {
            console.error("Error fetching recommended recipes:", err);
            return [];
        }
    },

    getIngredients: async () => {
        try {
            const response = await fetch('/api/getIngredients');

            if (response.status === 403) {
                throw new Error("API Forbidden (403): Check CORS or permissions");
            }
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);

            return await response.json();
        } catch (err) {
            console.error("Error fetching ingredients:", err);
            return [];
        }
    },
};

export default Api;
