import fetch from 'node-fetch';

const Api = {
    callApiGetRecipe: async (recipeId) => {
        try {
            const firebaseUid = localStorage.getItem('firebase_uid');
            const response = await fetch(`/api/getRecipe?id=${recipeId}&uid=${firebaseUid}`);
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
            return [];
        }
    },

    callApiGetIngredients: async () => {
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

    callApiGetCuisines: async () => {
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

    callApiGetCategories: async () => {
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

    callApiGetReviews: async (recipeId) => {
        try {
            const response = await fetch(`/api/getReviews?id=${recipeId}`);
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    },

    callApiUploadRecipe: async (recipeData) => {
        try {
            const response = await fetch('/api/uploadRecipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipeData),
            });
            const textBody = await response.text();
            let body;
            try {
                body = JSON.parse(textBody);
            } catch (e) {
                throw new Error('Failed to parse JSON response: ' + e.message);
            }

            if (response.status !== 200) throw new Error(body.message);
            return body;
        } catch (err) {
            console.error("Error uploading recipe:", err);
        }
    },

    callApiEditRecipe: async (payload) => {
        try {
            const response = await fetch('/api/editRecipe', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const textBody = await response.text();
            let body;
            try {
                body = JSON.parse(textBody);
            } catch (e) {
                console.error('Failed to parse JSON response:', textBody);
                throw new Error('Invalid JSON from server');
            }

            if (!response.ok) {
                console.error('Edit failed:', body);
                throw new Error(body.error || 'Error editing recipe');
            }

            return body;
        } catch (error) {
            console.error('API callApiEditRecipe error:', error);
            return { error: error.message || 'Unknown error' };
        }
    }
};

export default Api;
