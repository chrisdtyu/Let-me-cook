import mysql from 'mysql';
import config from './config.js';
import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import response from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'], 
    credentials: true 
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "client/build")));

// MySQL Connection
const connection = mysql.createConnection(config);
connection.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

app.post('/api/loadUserSettings', (req, res) => {

	let connection = mysql.createConnection(config);
	let userID = req.body.userID;

	let sql = `SELECT mode FROM user WHERE userID = ?`;
	console.log(sql);
	let data = [userID];
	console.log(data);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		let string = JSON.stringify(results);
		//let obj = JSON.parse(string);
		res.send({ express: string });
	});
	connection.end();
});

// create user API

app.post('/api/createUser', (req, res) => {

	let connection = mysql.createConnection(config);
	let formData = req.body;

	let sql = `INSERT INTO users
	(first_name,last_name,email,password)
	VALUES
	(?,?,?,?);`;
	let data = [formData.first_name,formData.last_name,formData.email,formData.password];
	console.log(sql, data);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			console.error(error.message);
			let string = JSON.stringify(error);
			res.statusCode = 500;
			res.send({ express: string });
			return;
		}
		console.log(results);
		let string = JSON.stringify(results);
		res.send({ express: string });
	});
	connection.end();
});

app.post('/api/getUser', (req, res) => {

	let connection = mysql.createConnection(config);
	let formData = req.body;

	let sql = `SELECT user_id,first_name,last_name,email,password 
	FROM users
	WHERE email = ?;`;
	let data = [formData.email];
	console.log(sql, data);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			console.error(error.message);
			let string = JSON.stringify(error);
			res.statusCode = 500;
			res.send({ express: string });
			return;
		}
		console.log(results);
		let string = JSON.stringify(results);
		res.send({ express: string });
	});
	connection.end();
});

// get recipe list API
app.get('/api/getRecipes', (req, res) => {

    let connection = mysql.createConnection(config);
    let sql = `SELECT recipe_id, name, prep_time FROM recipes`;
	let data = [];

    connection.query(sql, data, (error, results, fields) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: "Database query failed" });
        }
		if(results && results.length > 0) {
        	res.json(results);
		} else {
            return res.status(404).json({ error: "Data not found" });
		}
    });
    
    connection.end();
});

// get specific recipe API
app.get('/api/getRecipe', (req, res) => {
    const recipeId = req.query.id;

    if (!recipeId) {
        return res.status(400).json({ error: "Missing recipe ID" });
    }

    let connection = mysql.createConnection(config);
    let sql = `SELECT * FROM recipes WHERE recipe_id = ?`;
	let data = [recipeId];

    connection.query(sql, data, (error, results, fields) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: "Database query failed" });
        }
		if(results && results.length > 0) {
        	res.json(results[0]);
		} else {
            return res.status(404).json({ error: "Data not found" });
		}
    });
    
    connection.end();
});

// get recipe ingredints and quantities API
app.get('/api/getRecipeIngredients', (req, res) => {

	let connection = mysql.createConnection(config);
	let recipeId = req.query.id;
	
	let sql = `select i.ingredient_id, i.name, i.type, ri.quantity, ri.quantity_type
		from recipe_ingredients ri
		inner join ingredients i 
			on ri.ingredient_id = i.ingredient_id
		where recipe_id = ?;`;
		
	let data = [recipeId];

	connection.query(sql, data, (error, results) => {
		if (error) {
			console.error(error.message);
			return res.status(500).send("Database error");
		}
		if(results && results.length > 0) {
        	res.json(results);
		} else {
            return res.status(404).json({ error: "Data not found" });
		}	
	});
	connection.end();
});

// ---------------------------------------------------------------------
// Get dietary preferences
// ---------------------------------------------------------------------
app.get('/api/getDietaryPreferences', (req, res) => {
    const sql = "SELECT preference_id, preference_name FROM dietary_preferences";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ---------------------------------------------------------------------
// Search dietary preferences (if you still need it)
// ---------------------------------------------------------------------
app.get('/api/searchDietaryPreferences', (req, res) => {
    const searchQuery = req.query.q;
    const sql = "SELECT * FROM dietary_preferences WHERE preference_name LIKE ?";
    const data = [`%${searchQuery}%`];

    connection.query(sql, data, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ---------------------------------------------------------------------
// Get dietary restrictions
// ---------------------------------------------------------------------
app.get('/api/getDietaryRestrictions', (req, res) => {
    const sql = "SELECT dietary_id, dietary_name FROM dietary_restrictions";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// ---------------------------------------------------------------------
// Get ingredients for the "always available" prompt
// ---------------------------------------------------------------------
app.get('/api/getIngredients', (req, res) => {
    const sql = "SELECT ingredient_id, name, type FROM ingredients";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

/*
   Save Profile:
     - Inserts a new user in `users`.
     - Insert dietary preferences in `user_preferences`.
     - Insert dietary restrictions in `user_restrictions`.
     - Insert always-available ingredients in `user_ingredients` (with is_dietary_restriction = 0).
*/
app.post('/api/saveProfile', (req, res) => {
    const {
        firstName, lastName, email, password,
        dietaryPreferences, dietaryRestrictions,
        alwaysAvailable, healthGoals, weeklyBudget
    } = req.body;

    const userQuery = `
        INSERT INTO users (first_name, last_name, email, password, health_goals, weekly_budget)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const userData = [firstName, lastName, email, password, healthGoals, weeklyBudget];

    connection.query(userQuery, userData, (err, result) => {
        if (err) {
            console.error("Error inserting user:", err);
            return res.status(500).json({ error: "Database error inserting user" });
        }
        const userId = result.insertId;

        // ----------------------------------------------------------
        // Insert dietary preferences (user_preferences)
        // ----------------------------------------------------------
        if (dietaryPreferences && dietaryPreferences.length > 0) {
            let preferenceQuery = `
                INSERT INTO user_preferences (user_id, preference_id)
                VALUES ?
            `;
            let preferenceValues = dietaryPreferences.map(prefId => [userId, prefId]);
            connection.query(preferenceQuery, [preferenceValues], (errPref) => {
                if (errPref) {
                    console.error("Error saving dietary preferences:", errPref);
                }
            });
        }

        // ----------------------------------------------------------
        // Insert dietary restrictions (user_restrictions)
        // ----------------------------------------------------------
        if (dietaryRestrictions && dietaryRestrictions.length > 0) {
            let restrictionQuery = `
                INSERT INTO user_restrictions (user_id, dietary_id)
                VALUES ?
            `;
            let restrictionValues = dietaryRestrictions.map(item => [userId, item.dietary_id]);
            connection.query(restrictionQuery, [restrictionValues], (errRes) => {
                if (errRes) {
                    console.error("Error saving dietary restrictions:", errRes);
                }
            });
        }

        // ----------------------------------------------------------
        // Insert always-available ingredients (user_ingredients)
        // ----------------------------------------------------------
        if (alwaysAvailable && alwaysAvailable.length > 0) {
            // Suppose user_ingredients is: user_id, ingredient_id, is_dietary_restriction
            // We'll set is_dietary_restriction=0 here, meaning "just available," not a restriction.
            let ingredientsQuery = `
                INSERT INTO user_ingredients (user_id, ingredient_id, is_dietary_restriction)
                VALUES ?
            `;
            let ingredientsValues = alwaysAvailable.map(item => [userId, item.ingredient_id, 0]);
            connection.query(ingredientsQuery, [ingredientsValues], (errIng) => {
                if (errIng) {
                    console.error("Error saving always-available ingredients:", errIng);
                }
            });
        }

        return res.json({ message: "Profile saved successfully!" });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server