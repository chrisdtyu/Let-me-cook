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

// ============= MySQL Connection ============
const connection = mysql.createConnection(config);
connection.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL database");
});

// ============= CREATE USER (Sign-up) =============
app.post('/api/createUser', async (req, res) => {
	let { firebase_uid, firstName, lastName, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        let sql = `
          INSERT INTO users (firebase_uid, first_name, last_name, email, password)
          VALUES (?, ?, ?, ?, ?)
        `;
        let data = [firebase_uid, firstName, lastName, email, hashedPassword];

        connection.query(sql, data, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send({ express: JSON.stringify(error) });
            }
            res.send({ express: JSON.stringify(results) });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ express: "Error processing request" });
    }
});

// GET USER 
app.post('/api/getUser', (req, res) => {
    let { firebase_uid } = req.body;
    let sql = `
      SELECT user_id, first_name, last_name, email, password
      FROM users
      WHERE firebase_uid = ?
    `;

    connection.query(sql, [firebase_uid], async (error, results) => {
        if (error) {
            console.error(error.message);
            return res.status(500).send({ express: JSON.stringify(error) });
        }
        if (results.length > 0) {
            const user = results[0];
            res.send({ 
                express: JSON.stringify({
                    user_id: user.user_id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }) 
            });
        } else {
            res.status(404).send({ express: "User not found" });
        }
    });
});

// SAVE PROFILE 
app.post('/api/saveProfile', (req, res) => {
    const {
        firebase_uid,
        firstName,
        lastName,
        email,
        dietaryPreferences,
        dietaryRestrictions,
        alwaysAvailable,
        healthGoals,
        weeklyBudget
    } = req.body;

    // Insert if new, else update
    const upsertSql = `
      INSERT INTO users (firebase_uid, first_name, last_name, email, health_goals, weekly_budget)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        email = VALUES(email),
        health_goals = VALUES(health_goals),
        weekly_budget = VALUES(weekly_budget)
    `;
    const userData = [firebase_uid, firstName, lastName, email, healthGoals, weeklyBudget];

    connection.query(upsertSql, userData, (err, result) => {
        if (err) {
            console.error("Error upserting user:", err);
            return res.status(500).json({ error: "Database error upserting user" });
        }

        // get user_id for bridging tables
        const selectUserSql = `SELECT user_id FROM users WHERE firebase_uid = ?`;
        connection.query(selectUserSql, [firebase_uid], (err2, rows) => {
            if (err2) {
                console.error("Error retrieving user_id:", err2);
                return res.status(500).json({ error: "Database error retrieving user" });
            }
            if (!rows.length) {
                return res.status(500).json({ error: "User not found after upsert" });
            }
            const userId = rows[0].user_id;

            // user_preferences
            const deletePref = `DELETE FROM user_preferences WHERE user_id = ?`;
            connection.query(deletePref, [userId], (errDel) => {
                if (errDel) {
                    console.error("Error deleting old user_preferences:", errDel);
                } else if (dietaryPreferences && dietaryPreferences.length > 0) {
                    const vals = dietaryPreferences.map((p) => [userId, p]);
                    const insertPrefSql = `
                      INSERT INTO user_preferences (user_id, preference_id)
                      VALUES ?
                    `;
                    connection.query(insertPrefSql, [vals], (errPref) => {
                        if (errPref) {
                            console.error("Error inserting user_preferences:", errPref);
                        }
                    });
                }
            });

            // user_restrictions
            const deleteRestrict = `DELETE FROM user_restrictions WHERE user_id = ?`;
            connection.query(deleteRestrict, [userId], (errDel2) => {
                if (errDel2) {
                    console.error("Error deleting old user_restrictions:", errDel2);
                } else if (dietaryRestrictions && dietaryRestrictions.length > 0) {
                    const vals = dietaryRestrictions.map((r) => [userId, r.dietary_id]);
                    const insertResSql = `
                      INSERT INTO user_restrictions (user_id, dietary_id)
                      VALUES ?
                    `;
                    connection.query(insertResSql, [vals], (errRes) => {
                        if (errRes) {
                            console.error("Error inserting user_restrictions:", errRes);
                        }
                    });
                }
            });

            // user_ingredients
            const deleteIng = `DELETE FROM user_ingredients WHERE user_id = ?`;
            connection.query(deleteIng, [userId], (errDel3) => {
                if (errDel3) {
                    console.error("Error deleting old user_ingredients:", errDel3);
                } else if (alwaysAvailable && alwaysAvailable.length > 0) {
                    const vals = alwaysAvailable.map((i) => [userId, i.ingredient_id]);
                    const insertIngSql = `
                      INSERT INTO user_ingredients (user_id, ingredient_id)
                      VALUES ?
                    `;
                    connection.query(insertIngSql, [vals], (errIng) => {
                        if (errIng) {
                            console.error("Error inserting user_ingredients:", errIng);
                        }
                    });
                }
            });

            return res.json({ message: "Profile saved successfully!" });
        });
    });
});

// /api/recommendRecipes 
app.post('/api/recommendRecipes', (req, res) => {
    let connection = mysql.createConnection(config);
    let { ingredients, cuisines, categories, userId, budgetMode, maxTime } = req.body;

    console.log("Incoming Request:", { ingredients, cuisines, categories, userId, budgetMode, maxTime });

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
        LIMIT 10
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

        // get missing ingredients
        let recipeIDs = recipes.map(r => r.recipe_id);
        let missingQuery = `
            SELECT ri.recipe_id, i.name AS missing_ingredient, s.substitute_name, s.cost
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
            LEFT JOIN substitutes s ON i.ingredient_id = s.ingredient_id
            WHERE ri.recipe_id IN (${recipeIDs.map(() => '?').join(',')})
            AND i.name NOT IN (${ingredients_placeholders});
        `;
        connection.query(missingQuery, [...recipeIDs, ...ingredients], (err2, missingIngredients) => {
            if (err2) {
                console.error('Error fetching missing ingredients:', err2);
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

// getRecipe
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

// getDietaryPreferences, getDietaryRestrictions, etc. 
app.get('/api/getDietaryPreferences', (req, res) => {
    const sql = "SELECT preference_id, preference_name FROM dietary_preferences";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.get('/api/getDietaryRestrictions', (req, res) => {
    const sql = "SELECT dietary_id, dietary_name FROM dietary_restrictions";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.get('/api/getIngredients', (req, res) => {
    const sql = "SELECT ingredient_id, name, type FROM ingredients";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Database error", error);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.get('/api/getCuisines', (req, res) => {
    const sql = "SELECT DISTINCT type FROM recipes ORDER BY type";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        let response = results.map(row => row.type);
        res.json(response);
    });
});

app.get('/api/getCategories', (req, res) => {
    const sql = "SELECT DISTINCT category FROM recipes ORDER BY category";
    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Database error" });
        }
        let response = results.map(row => row.category);
        res.json(response);
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

//review API's
app.get('/api/getReviews', (req, res) => {
    const recipeId = req.query.id;
    if (!recipeId) {
        return res.status(400).json({ error: "Missing recipe ID" });
    }

    let connection = mysql.createConnection(config);
    let sql = `
        SELECT r.*, u.first_name, u.last_name 
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id 
        WHERE recipe_id = ?`;
    let data = [recipeId];

    connection.query(sql, data, (error, results, fields) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json(results);
    });
    
    connection.end();
});


app.post('/api/addReview', (req, res) => {

	let connection = mysql.createConnection(config);
	let reviewData = req.body;
	let sql = `INSERT INTO reviews
		(user_id,
        recipe_id,
        review_title,
        review_score,
        review_content)
		VALUES
		(?,?,?,?,?);`;

	let data = [reviewData.user_id, reviewData.recipe_id, reviewData.review_title, reviewData.review_score, reviewData.review_content];

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}
		res.send(results);
	});
	connection.end();
});