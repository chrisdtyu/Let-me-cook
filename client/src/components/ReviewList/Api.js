import fetch from 'node-fetch';

const Api = {

    // Loading review from the API
    callApiGetReviews: async (recipeId) => {
        try {
            const response = await fetch(`/api/getReviews?id=${recipeId}`);
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.error("Error fetching ingredients:", err);
        }
    },
};

export default Api;