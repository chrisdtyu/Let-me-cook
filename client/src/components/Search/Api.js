import fetch from 'node-fetch';

const Api = {
    callApiGetRecipes: async () => {
        try {
            const response = await fetch(`/api/getRecipes`);
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.error("Error fetching recipe:", err);
        }
    },
};

export default Api;