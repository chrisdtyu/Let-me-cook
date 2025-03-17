import fetch from 'node-fetch';


const Api = {

    // Save review to database using addReview API
    callApiAddReview: async (reviewData) => {
        try {
            const response = await fetch("/api/addReview", {
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
