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

    getUserProfile: async (firebase_uid) => {
        try {
            const response = await fetch('/api/getUserProfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebase_uid }),
            });
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            const data = await response.json();
            return data.alwaysAvailable || [];
        } catch (err) {
            console.error("Error fetching user profile:", err);
            return [];
        }
    },

    callApiRecommendRecipes: async (ingredients, cuisines, categories, budgetMode, maxTime, userId) => {
        try {
            const response = await fetch('/api/recommendRecipes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, cuisines, categories, budgetMode, maxTime, userId })
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

    getCuisines: async () => {
        try {
            const response = await fetch('/api/getCuisines');
            if (response.status === 403) {
                throw new Error("API Forbidden (403): Check CORS or permissions");
            }
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (err) {
            console.error("Error fetching cuisines:", err);
            return [];
        }
    },

    getCategories: async () => {
        try {
            const response = await fetch('/api/getCategories');
            if (response.status === 403) {
                throw new Error("API Forbidden (403): Check CORS or permissions");
            }
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (err) {
            console.error("Error fetching categories:", err);
            return [];
        }
    },

    markTried: async (user_id, recipe_id) => {
        try {
            const response = await fetch('/api/markTried', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, recipe_id }),
            });
            if (!response.ok) {
                throw new Error(`Failed to mark tried: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error marking tried:", error);
            return null;
        }
    },

    unmarkTried: async (user_id, recipe_id) => {
        try {
            const response = await fetch('/api/unmarkTried', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, recipe_id }),
            });
            if (!response.ok) {
                throw new Error(`Failed to unmark tried: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error unmarking tried:", error);
            return null;
        }
    },

    markFavourite: async (user_id, recipe_id) => {
        try {
            const response = await fetch('/api/markFavourite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, recipe_id }),
            });
            if (!response.ok) {
                throw new Error(`Failed to mark favourite: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error marking favourite:", error);
            return null;
        }
    },

    unmarkFavourite: async (user_id, recipe_id) => {
        try {
            const response = await fetch('/api/unmarkFavourite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, recipe_id }),
            });
            if (!response.ok) {
                throw new Error(`Failed to unmark favourite: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error unmarking favourite:", error);
            return null;
        }
    },

    getUserRestrictions: async (userId) => {
        try {
            const response = await fetch('/api/getUserRestrictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            if (!response.ok) throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            return await response.json();
        } catch (err) {
            console.error("Error fetching user restrictions:", err);
            return [];
        }
    }
};

export default Api;
