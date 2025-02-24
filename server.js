import mysql from 'mysql';
import config from './config.js';
import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import cors from 'cors';
import response from 'express';
import bcrypt from 'bcrypt';

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

app.post('/api/createUser', async (req, res) => {
	// console.log({message: "createUser"});
	let connection = mysql.createConnection(config);
	let { firebase_uid, personalName, email, password } = req.body;
	
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password

        let sql = `INSERT INTO users (firebase_uid, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?)`;
        let data = [firebase_uid, personalName, personalName, email, hashedPassword];
		// console.log({message: "createUser-data:", sql, data});
        connection.query(sql, data, (error, results) => {
			// console.log({message: "createUser-result:", error, results});
            if (error) {
                console.error(error);
                res.status(500).send({ express: JSON.stringify(error) });
                return;
            }
            res.send({ express: JSON.stringify(results) });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ express: "Error processing request" });
    } finally {
        connection.end();
    }
});


app.post('/api/getUser', (req, res) => {
    let connection = mysql.createConnection(config);
    let { firebase_uid} = req.body;

    let sql = `SELECT user_id, first_name, last_name, email, password FROM users WHERE firebase_uid = ?`;
    connection.query(sql, [firebase_uid], async (error, results) => {
        if (error) {
            console.error(error.message);
            res.status(500).send({ express: JSON.stringify(error) });
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            res.send({ express: JSON.stringify({ user_id: user.user_id, personalName: user.personalName, email: user.email }) });
        } else {
            res.status(404).send({ express: "User not found" });
        }
    });

    connection.end();
});

// get recipe list API
app.get('/api/getRecipes', (req, res) => {

    let connection = mysql.createConnection(config);
    let sql = `SELECT recipe_id, name, image, prep_time FROM recipes`;
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
	
	let sql = `select i.ingredient_id, i.name, i.type, ri.quantity, ri.quantity_type, ri.required
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

// Get dietary preferences
app.get('/api/getDietaryPreferences', (req, res) => {
    const sql = "SELECT preference_id, preference_name FROM dietary_preferences";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Search dietary preferences
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

// Get dietary restrictions
app.get('/api/getDietaryRestrictions', (req, res) => {
    const sql = "SELECT dietary_id, dietary_name FROM dietary_restrictions";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Get ingredients for the "always available" prompt
app.get('/api/getIngredients', (req, res) => {
    const sql = "SELECT ingredient_id, name, type FROM ingredients";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// Get CuisineType
app.get('/api/getCuisines', (req, res) => {
    const sql = "SELECT DISTINCT type FROM recipes ORDER BY type";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
		console.log(results);
		let response = results.map((row) => row.type);
        res.json(response);
    });
});

// Get Category of Food
app.get('/api/getCategories', (req, res) => {
    const sql = "SELECT DISTINCT category FROM recipes ORDER BY category";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
		console.log(results);
		let response = results.map((row) => row.category);
        res.json(response);
    });
});


//Save Profile:
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

        // Insert dietary preferences (user_preferences)
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

        // Insert dietary restrictions (user_restrictions)
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

        // Insert always-available ingredients (user_ingredients)
        if (alwaysAvailable && alwaysAvailable.length > 0) {
            let ingredientsQuery = `
                INSERT INTO user_ingredients (user_id, ingredient_id)
                VALUES ?
            `;
            let ingredientsValues = alwaysAvailable.map(item => [userId, item.ingredient_id]);
            connection.query(ingredientsQuery, [ingredientsValues], (errIng) => {
                if (errIng) {
                    console.error("Error saving always-available ingredients:", errIng);
                }
            });
        }

        return res.json({ message: "Profile saved successfully!" });
    });
});

app.post('/api/recommendRecipes', (req, res) => {
    let connection = mysql.createConnection(config);
    let { ingredients, cuisines, categories, userId, budgetMode, maxTime } = req.body;

    console.log("Incoming Request:", {ingredients, cuisines, categories, userId, budgetMode, maxTime});

	if (!Array.isArray(categories)) {
        console.error('Categories is not an array:', categories);
        return res.status(400).json({ error: 'Categories should be an array' });
    }

    if (!ingredients || ingredients.length === 0) {
        console.log("No ingredients provided!");
        return res.status(400).json({ error: 'Please provide available ingredients' });
    }

    let ingredients_placeholders = ingredients.map(() => '?').join(',');
	let cuisine_placeholders = cuisines.map(() => '?').join(',');
	let categories_placeholders = categories.map(() => '?').join(',');
	
	let where = '';
	if (cuisine_placeholders.length > 0 && categories_placeholders.length > 0) {
		where = `WHERE r.type in (${cuisine_placeholders}) AND r.category in (${categories_placeholders})`;
	} else if (cuisine_placeholders.length > 0) {
		where = `WHERE r.type in (${cuisine_placeholders})`;
	} else if (categories_placeholders.length > 0) {
		where = `WHERE r.category in (${categories_placeholders})`;
	}

	if (maxTime) {
        where += where ? ` AND r.prep_time <= ?` : `WHERE r.prep_time <= ?`;
    }

    let query = `
        SELECT r.recipe_id, r.name, r.type, r.category, r.prep_time, r.instructions, 
               GROUP_CONCAT(i.name) AS recipe_ingredients, 
               COUNT(ri.ingredient_id) AS total_ingredients,
               SUM(CASE WHEN i.name NOT IN (${ingredients_placeholders}) THEN 1 ELSE 0 END) AS missing_ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        ${where} 
		GROUP BY r.recipe_id
        ORDER BY missing_ingredients ASC, total_ingredients DESC
        LIMIT 10;
    `;
	let data = [...ingredients, ...cuisines, ...categories];
	if (maxTime) {
		data.push(maxTime);
	}
    console.log("Executing SQL:", query);
    console.log("With values:", data);

    connection.query(query, data, (err, recipes) => {
        if (err) {
            console.error('Error fetching recipes:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (recipes.length === 0) {
            return res.json({ message: "No suitable recipes found" });
        }

        // Get missing ingredients and suggest substitutes
        let recipeIDs = recipes.map(r => r.recipe_id);
        let missingQuery = `
            SELECT ri.recipe_id, i.name AS missing_ingredient, s.substitute_name, s.cost
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
            LEFT JOIN substitutes s ON i.ingredient_id = s.ingredient_id
            WHERE ri.recipe_id IN (${recipeIDs.map(() => '?').join(',')})
            AND i.name NOT IN (${ingredients_placeholders});
        `;

        console.log("Fetching missing ingredients:", missingQuery);
        
        connection.query(missingQuery, [...recipeIDs, ...ingredients], (err, missingIngredients) => {
            if (err) {
                console.error('Error fetching missing ingredients:', err);
                return res.status(500).json({ error: 'Database query failed' });
            }

            let recipeData = recipes.map(recipe => {
                let missing = missingIngredients.filter(m => m.recipe_id === recipe.recipe_id);

                return {
                    ...recipe,
                    missingIngredients: missing.map(m => ({
                        name: m.missing_ingredient,
                        suggestedSubstitute: budgetMode ? m.substitute_name : null,
                        estimatedCost: budgetMode ? m.cost : null
                    }))
                };
            });

            res.json(recipeData);
            connection.end();
        });
    });
});






app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server