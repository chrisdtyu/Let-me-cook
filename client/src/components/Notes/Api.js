import fetch from 'node-fetch';


const Api = {
    // Save notes to database
    callApiAddNote: async (reviewData) => {
        try {
            const response = await fetch("/api/addNote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reviewData),
            });
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.log("error:", err);
        }
    },

    callApiGetNote: async (recipeId, userId) => {
        try {
            const response = await fetch(`/api/getNote?user_id=${userId}&recipe_id=${recipeId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.log("error:", err);
        }
    },

    // Get user details based on firebase_uid
    callApiGetUser: async (firebaseUid) => {
        try {
            const response = await fetch("/api/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ firebase_uid: firebaseUid }),
            });
            const body = await response.json();
            if (response.status !== 200) throw Error(body.message);
            return body;
        } catch (err) {
            console.log("error:", err);
        }
    }
};


export default Api;
