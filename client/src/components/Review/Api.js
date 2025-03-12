import fetch from 'node-fetch';

const Api = {

    // Loading movies from the API
    callApiGetMovies: async () => {
        try{
        const response = await fetch("/api/getMovies", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            }
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
        }
        catch(err){
        console.log("error:", err)
        }    
    },    
    // Save review to database using addReview API
    callApiAddReview: async (reviewData) => {
        try{
        const response = await fetch("/api/addReview", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(reviewData)
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
        }
        catch(err){
        console.log("error:", err)
        }
    }
};

export default Api;