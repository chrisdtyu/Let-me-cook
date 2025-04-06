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

// create user
app.post('/api/createUser', async (req, res) => {
    let { firebase_uid, firstName, lastName, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
          INSERT INTO users (firebase_uid, first_name, last_name, email, password)
          VALUES (?, ?, ?, ?, ?)
        `;
        const data = [firebase_uid, firstName, lastName, email, hashedPassword];

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

// get user
app.post('/api/getUser', (req, res) => {
    const { firebase_uid } = req.body;
    const sql = `
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

app.post('/api/getUserSearchProfile', (req, res) => {
    const { firebase_uid } = req.body;

    if (!firebase_uid) {
        return res.status(400).json({ error: "Missing firebase_uid" });
    }

    const getUserIdSql = `SELECT user_id FROM users WHERE firebase_uid = ?`;

    connection.query(getUserIdSql, [firebase_uid], (err, results) => {
        if (err) {
            console.error("Error fetching user ID:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (!results.length) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = results[0].user_id;

        const alwaysAvailableSql = `
            SELECT i.name
            FROM user_ingredients ui
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE ui.user_id = ?
        `;

        const restrictionsSql = `
            SELECT i.name
            FROM user_restrictions ur
            JOIN ingredients i ON ur.dietary_id = i.ingredient_id
            WHERE ur.user_id = ?
        `;

        connection.query(alwaysAvailableSql, [userId], (err1, alwaysRows) => {
            if (err1) {
                console.error("Error fetching always available ingredients:", err1);
                return res.status(500).json({ error: "Database error" });
            }

            connection.query(restrictionsSql, [userId], (err2, restrictRows) => {
                if (err2) {
                    console.error("Error fetching dietary restrictions:", err2);
                    return res.status(500).json({ error: "Database error" });
                }

                const alwaysAvailable = alwaysRows.map(row => row.name).filter(Boolean);
                const dietaryRestrictions = restrictRows.map(row => row.name).filter(Boolean);

                return res.json({
                    alwaysAvailable,
                    dietaryRestrictions
                });
            });
        });
    });
});

// get user profile
app.post('/api/getUserProfile', (req, res) => {
    const { firebase_uid } = req.body;
    if (!firebase_uid) {
        return res.status(400).json({ error: "Missing firebase_uid" });
    }

    const userSql = `
      SELECT user_id, first_name, last_name, email, weekly_budget
      FROM users
      WHERE firebase_uid = ?
    `;
    connection.query(userSql, [firebase_uid], (err, results) => {
        if (err) {
            console.error("Error fetching user row:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (!results.length) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = results[0];
        const userId = user.user_id;

        const prefsSql = `SELECT preference_id FROM user_preferences WHERE user_id = ?`;
        const restrictSql = `SELECT dietary_id FROM user_restrictions WHERE user_id = ?`;

        const ingSql = `
          SELECT i.name
          FROM user_ingredients ui
          JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
          WHERE ui.user_id = ?
        `;
        const goalsSql = `SELECT goal_id FROM user_goals WHERE user_id = ?`;

        connection.query(prefsSql, [userId], (errPref, prefRows) => {
            if (errPref) {
                console.error("Error fetching user preferences:", errPref);
                return res.status(500).json({ error: "Database error" });
            }
            connection.query(restrictSql, [userId], (errRestrict, restrictRows) => {
                if (errRestrict) {
                    console.error("Error fetching user restrictions:", errRestrict);
                    return res.status(500).json({ error: "Database error" });
                }
                connection.query(ingSql, [userId], (errIng, ingRows) => {
                    if (errIng) {
                        console.error("Error fetching user ingredients:", errIng);
                        return res.status(500).json({ error: "Database error" });
                    }
                    connection.query(goalsSql, [userId], (errGoals, goalRows) => {
                        if (errGoals) {
                            console.error("Error fetching user goals:", errGoals);
                            return res.status(500).json({ error: "Database error" });
                        }

                        const dietaryPreferences = prefRows.map(row => row.preference_id);
                        const dietaryRestrictions = restrictRows.map(row => ({ dietary_id: row.dietary_id }));
                        const alwaysAvailable = ingRows.map(row => ({
                            ingredient_name: row.name  
                        }));
                        const healthGoals = goalRows.map(row => row.goal_id);

                        return res.json({
                            user: { ...user },
                            dietaryPreferences,
                            dietaryRestrictions,
                            alwaysAvailable,
                            healthGoals
                        });
                    });
                });
            });
        });
    });
});

// save profile
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

    const weeklyBudgetValue = (weeklyBudget === '') ? null : weeklyBudget;

    const upsertSql = `
      INSERT INTO users (firebase_uid, first_name, last_name, email, weekly_budget)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        email = VALUES(email),
        weekly_budget = VALUES(weekly_budget)
    `;
    const userData = [firebase_uid, firstName, lastName, email, weeklyBudgetValue];

    connection.query(upsertSql, userData, (err, result) => {
        if (err) {
            console.error("Error upserting user:", err);
            return res.status(500).json({ error: "Database error upserting user" });
        }

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
                    const vals = dietaryPreferences.map(p => [userId, p]);
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
                    const vals = dietaryRestrictions.map(r => [userId, r.dietary_id]);
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

            const deleteIngSql = `DELETE FROM user_ingredients WHERE user_id = ?`;
            connection.query(deleteIngSql, [userId], (errDel3) => {
                if (errDel3) {
                    console.error("Error deleting old user_ingredients:", errDel3);
                } else {
                    if (!alwaysAvailable || alwaysAvailable.length === 0) {
                    } else {
                        const newRows = []; 
                        let itemsProcessed = 0;

                        alwaysAvailable.forEach((row) => {
                            if (!row.ingredient_name) {
                                itemsProcessed++;
                                if (itemsProcessed === alwaysAvailable.length) insertBridgingRows();
                                return;
                            }

                            const findIngSql = `SELECT ingredient_id FROM ingredients WHERE name = ? LIMIT 1`;
                            connection.query(findIngSql, [row.ingredient_name], (errFind, resFind) => {
                                if (errFind) {
                                    console.error("Error finding ingredient_id:", errFind);
                                } else if (resFind && resFind.length > 0) {
                                    newRows.push([userId, resFind[0].ingredient_id]);
                                }
                                itemsProcessed++;
                                if (itemsProcessed === alwaysAvailable.length) {
                                    insertBridgingRows();
                                }
                            });
                        });

                        function insertBridgingRows() {
                            if (!newRows.length) return;
                            const sqlInsert = `
                              INSERT INTO user_ingredients (user_id, ingredient_id)
                              VALUES ?
                            `;
                            connection.query(sqlInsert, [newRows], (errInsert) => {
                                if (errInsert) {
                                    console.error("Error inserting user_ingredients:", errInsert);
                                }
                            });
                        }
                    }
                }
            });

            // user_goals
            const deleteGoals = `DELETE FROM user_goals WHERE user_id = ?`;
            connection.query(deleteGoals, [userId], (errDel4) => {
                if (errDel4) {
                    console.error("Error deleting old user_goals:", errDel4);
                } else if (healthGoals && healthGoals.length > 0) {
                    const vals = healthGoals.map(g => [userId, g]);
                    const insertGoalsSql = `
                      INSERT INTO user_goals (user_id, goal_id)
                      VALUES ?
                    `;
                    connection.query(insertGoalsSql, [vals], (errGoals) => {
                        if (errGoals) {
                            console.error("Error inserting user_goals:", errGoals);
                        }
                    });
                }
            });

            return res.json({ message: "Profile saved successfully!" });
        });
    });
});

// mark/unmark as tried
app.post('/api/markTried', (req, res) => {
    const { user_id, recipe_id } = req.body;
    if (!user_id || !recipe_id) {
        return res.status(400).json({ error: "Missing user_id or recipe_id" });
    }
    const sql = `INSERT IGNORE INTO user_tried (user_id, recipe_id) VALUES (?, ?)`;
    connection.query(sql, [user_id, recipe_id], (err, results) => {
        if (err) {
            console.error("Error marking tried:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Recipe marked as tried" });
    });
});

app.post('/api/unmarkTried', (req, res) => {
    const { user_id, recipe_id } = req.body;
    if (!user_id || !recipe_id) {
        return res.status(400).json({ error: "Missing user_id or recipe_id" });
    }
    const sql = `DELETE FROM user_tried WHERE user_id = ? AND recipe_id = ?`;
    connection.query(sql, [user_id, recipe_id], (err, results) => {
        if (err) {
            console.error("Error unmarking tried:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Recipe unmarked as tried" });
    });
});

// mark/unmark as favourite
app.post('/api/markFavourite', (req, res) => {
    const { user_id, recipe_id } = req.body;
    if (!user_id || !recipe_id) {
        return res.status(400).json({ error: "Missing user_id or recipe_id" });
    }
    const sql = `INSERT IGNORE INTO user_favourites (user_id, recipe_id) VALUES (?, ?)`;
    connection.query(sql, [user_id, recipe_id], (err, results) => {
        if (err) {
            console.error("Error marking favourite:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Recipe marked as favourite" });
    });
});

app.post('/api/unmarkFavourite', (req, res) => {
    const { user_id, recipe_id } = req.body;
    if (!user_id || !recipe_id) {
        return res.status(400).json({ error: "Missing user_id or recipe_id" });
    }
    const sql = `DELETE FROM user_favourites WHERE user_id = ? AND recipe_id = ?`;
    connection.query(sql, [user_id, recipe_id], (err, results) => {
        if (err) {
            console.error("Error unmarking favourite:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Recipe unmarked as favourite" });
    });
});

// get user tried/favourite recipes
app.post('/api/getUserRecipes', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }
    const triedSql = `
        SELECT r.recipe_id, r.name
        FROM user_tried ut
        JOIN recipes r ON ut.recipe_id = r.recipe_id
        WHERE ut.user_id = ?
    `;
    const favSql = `
        SELECT r.recipe_id, r.name
        FROM user_favourites uf
        JOIN recipes r ON uf.recipe_id = r.recipe_id
        WHERE uf.user_id = ?
    `;
    connection.query(triedSql, [user_id], (errTried, triedRows) => {
        if (errTried) {
            console.error("Error fetching tried recipes:", errTried);
            return res.status(500).json({ error: "Database error" });
        }
        connection.query(favSql, [user_id], (errFav, favRows) => {
            if (errFav) {
                console.error("Error fetching favourite recipes:", errFav);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({
                tried: triedRows,
                favourites: favRows
            });
        });
    });
});

// recommendRecipes
app.post('/api/recommendRecipes', (req, res) => {
    let connection2 = mysql.createConnection(config);
    let { ingredients, cuisines, categories, userId, budgetMode, maxTime, restrictedIngredients = [] } = req.body;

    if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories should be an array' });
    }
    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: 'Please provide available ingredients' });
    }

    let ingredients_placeholders = ingredients.map(() => '?').join(',');
    let cuisine_placeholders = cuisines.map(() => '?').join(',');
    let categories_placeholders = categories.map(() => '?').join(',');
    let restricted_placeholders = restrictedIngredients.map(() => '?').join(',');

    // build WHERE clause from clauses array
    let whereClauses = [];
    if (cuisine_placeholders.length > 0) {
        whereClauses.push(`r.type IN (${cuisine_placeholders})`);
    }
    if (categories_placeholders.length > 0) {
        whereClauses.push(`r.category IN (${categories_placeholders})`);
    }
    if (maxTime) {
        whereClauses.push(`r.prep_time <= ?`);
    }
    if (budgetMode) {
        whereClauses.push(`i.price IS NOT NULL`);
    }
    if (restricted_placeholders.length > 0) {
        whereClauses.push(`
            r.recipe_id NOT IN (
                SELECT ri.recipe_id
                FROM recipe_ingredients ri
                JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                WHERE i.name IN (${restricted_placeholders})
            )
        `);
    }

    let where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let query = `
        SELECT r.recipe_id, r.name, r.type, r.category, r.prep_time, r.instructions, r.image,
            GROUP_CONCAT(i.name) AS recipe_ingredients,
            GROUP_CONCAT(i.price) AS ingredient_prices,
            COUNT(ri.ingredient_id) AS total_ingredients,
            SUM(CASE WHEN i.name NOT IN (${ingredients_placeholders}) THEN 1 ELSE 0 END) AS missing_ingredients,
            (SELECT AVG(review_score) FROM reviews re WHERE re.recipe_id = r.recipe_id) AS average_rating
        FROM recipes r
        JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        ${where}
        GROUP BY r.recipe_id
        ORDER BY missing_ingredients ASC, total_ingredients DESC
        LIMIT 15
    `;

    let data = [...ingredients, ...cuisines, ...categories];
    if (maxTime) data.push(maxTime);
    if (restrictedIngredients.length > 0) data.push(...restrictedIngredients);

    connection2.query(query, data, (err, recipes) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        if (recipes.length === 0) return res.json({ message: 'No suitable recipes found' });

        const recipeIDs = recipes.map(r => r.recipe_id);
        const missingQuery = `
            SELECT ri.recipe_id, i.name AS missing_ingredient, s.substitute_name, s.cost
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
            LEFT JOIN substitutes s ON i.ingredient_id = s.ingredient_id
            ${budgetMode ? 'AND s.cost IS NOT NULL' : ''}
            WHERE ri.recipe_id IN (${recipeIDs.map(() => '?').join(',')})
            AND i.name NOT IN (${ingredients_placeholders});
        `;
        connection2.query(missingQuery, [...recipeIDs, ...ingredients], (err2, missingIngredients) => {
            if (err2) return res.status(500).json({ error: 'Database query failed' });

            const alwaysAvailableQuery = `SELECT ingredient_id FROM user_ingredients WHERE user_id = ?`;
            connection2.query(alwaysAvailableQuery, [userId], (err3, availableRows) => {
                if (err3) return res.status(500).json({ error: 'Database query failed' });
                const availableIds = new Set(availableRows.map(r => r.ingredient_id));

                const ingredientCostQuery = `
                    SELECT ri.recipe_id, i.ingredient_id, i.price
                    FROM recipe_ingredients ri
                    JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
                    WHERE ri.recipe_id IN (${recipeIDs.map(() => '?').join(',')})
                `;
                connection2.query(ingredientCostQuery, recipeIDs, (err4, costRows) => {
                    if (err4) return res.status(500).json({ error: 'Database query failed' });

                    const costMap = {};
                    costRows.forEach(row => {
                        if (!availableIds.has(row.ingredient_id) && row.price !== null) {
                            if (!costMap[row.recipe_id]) costMap[row.recipe_id] = 0;
                            costMap[row.recipe_id] += parseFloat(row.price);
                        }
                    });

                    let recipeData = recipes.map(recipe => {
                        const allIngredients = recipe.recipe_ingredients.split(',');
                        const prices = recipe.ingredient_prices.split(',').map(parseFloat);
                        const ingredientsWithPrices = allIngredients.map((name, index) => ({
                            name,
                            price: prices[index] || null
                        }));
                        let missing = missingIngredients.filter(m => m.recipe_id === recipe.recipe_id);
                        return {
                            ...recipe,
                            estimated_cost: parseFloat((costMap[recipe.recipe_id] || 0).toFixed(2)),
                            ingredients: ingredientsWithPrices,
                            missingIngredients: missing.map(m => ({
                                name: m.missing_ingredient,
                                suggestedSubstitute: budgetMode ? m.substitute_name : null,
                                estimatedCost: budgetMode ? m.cost : null
                            }))
                        };
                    });

                    res.json(recipeData);
                    connection2.end();
                });
            });
        });
    });
});

// getRecipe
app.get('/api/getRecipe', (req, res) => {
    const recipeId = req.query.id;
    const firebase_uid = req.query.uid;
    
    if (!recipeId) {
        return res.status(400).json({ error: "Missing recipe ID" });
    }

    let connection3 = mysql.createConnection(config);
    let sql = `SELECT * FROM recipes WHERE recipe_id = ?`;
    let data = [recipeId];

    connection3.query(sql, data, (error, results, fields) => {
        if (error) {
            console.error("Database Error:", error);
            connection3.end();
            return res.status(500).json({ error: "Database query failed" });
        }
        if (!results || results.length === 0) {
            connection3.end();
            return res.status(404).json({ error: "Recipe not found" });
        }
        let recipe = results[0];

        const ingredientSql = `
            SELECT i.ingredient_id, i.price
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
            WHERE ri.recipe_id = ?
        `;
        
        connection3.query(ingredientSql, [recipeId], (err2, ingredientRows) => {
            if (err2) {
                console.error("Error fetching ingredients:", err2);
                connection3.end();
                recipe.estimated_cost = null;
                return res.json(recipe);
            }

            if (!firebase_uid) {
                const total = ingredientRows.reduce((sum, i) => sum + (i.price || 0), 0);
                recipe.estimated_cost = parseFloat(total.toFixed(2));
                connection3.end();
                return res.json(recipe);
            }

            // Get alwaysAvailable ingredients based on firebase_uid
            const availableSql = `
                SELECT i.ingredient_id
                FROM user_ingredients ui
                JOIN users u ON ui.user_id = u.user_id
                JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
                WHERE u.firebase_uid = ?
            `;
            connection3.query(availableSql, [firebase_uid], (err3, availableRows) => {
                if (err3) {
                    console.error("Error fetching always available ingredients:", err3);
                    recipe.estimated_cost = null;
                    connection3.end();
                    return res.json(recipe);
                }

                const availableSet = new Set(availableRows.map(r => r.ingredient_id));
                const total = ingredientRows.reduce((sum, i) => {
                    if (!availableSet.has(i.ingredient_id)) {
                        return sum + (i.price || 0);
                    }
                    return sum;
                }, 0);

                recipe.estimated_cost = parseFloat(total.toFixed(2));
                connection3.end();
                res.json(recipe);
            });
        });
    });
});

// getRecipeIngredients
app.get('/api/getRecipeIngredients', (req, res) => {
    let connection4 = mysql.createConnection(config);
    let recipeId = req.query.id;
    let sql = `select i.ingredient_id, i.name, i.type, i.price, ri.quantity, ri.quantity_type, ri.required
        from recipe_ingredients ri
        inner join ingredients i 
            on ri.ingredient_id = i.ingredient_id
        where recipe_id = ?;`;
    let data = [recipeId];

    connection4.query(sql, data, (error, results) => {
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
    connection4.end();
});

// get dietary preferences/restrictions
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
    const sql = "SELECT ingredient_id, name, type, price FROM ingredients";
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

// get health goals
app.get('/api/getHealthGoals', (req, res) => {
    const sql = "SELECT goal_id, goal_name FROM health_goals";
    connection.query(sql, (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

// review APIs
app.get('/api/getReviews', (req, res) => {
    const recipeId = req.query.id;
    if (!recipeId) {
        return res.status(400).json({ error: "Missing recipe ID" });
    }

    let connection5 = mysql.createConnection(config);
    let sql = `
        SELECT r.*, u.first_name, u.last_name, 
               (SELECT AVG(review_score) FROM reviews WHERE recipe_id = ?) AS average_rating
        FROM reviews r
        INNER JOIN users u ON r.user_id = u.user_id 
        WHERE r.recipe_id = ?
    `;

    let data = [recipeId, recipeId];

    connection5.query(sql, data, (error, results, fields) => {
        if (error) {
            console.error("Database Error:", error);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json({ reviews: results, average_rating: results[0]?.average_rating });
    });

    connection5.end();
});

app.post('/api/addReview', (req, res) => {
    let connection6 = mysql.createConnection(config);
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

    connection6.query(sql, data, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        res.send(results);
    });
    connection6.end();
});

app.post('/api/addNote', (req, res) => {
    let connection6 = mysql.createConnection(config);
    let noteData = req.body;
    let sql = `INSERT INTO notes (user_id, recipe_id, note) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE note = VALUES(note);`;

    let data = [noteData.user_id, noteData.recipe_id, noteData.note];

    connection6.query(sql, data, (error, results) => {
        if (error) {
            return console.error(error.message);
        }
        res.send(results);
    });
    connection6.end();
});

app.get('/api/getNote', (req, res) => {
    let connection6 = mysql.createConnection(config);
    let { user_id, recipe_id } = req.query; 
    let sql = `SELECT * from notes WHERE user_id = ? AND recipe_id = ?`;

    let data = [user_id, recipe_id];

    connection6.query(sql, data, (error, results) => {
        if (error) {
            return console.error(error.message);
        }
        res.json(results[0] || {});
    });
    connection6.end();
});

// Api To Upload Recipes
app.post('/api/uploadRecipe', (req, res) => {
    const { user_id, name, category, type, instructions, image, video, prep_time, ingredients } = req.body;
    console.log('Received request to upload recipe:', req.body);
    if (!user_id || !name || !instructions || !prep_time || !ingredients || ingredients.length === 0) {
        console.error('Missing required fields:', { user_id, name, instructions, prep_time, ingredients });
        return res.status(400).json({ error: "Missing required fields" });
    }
    let connectionUpload = mysql.createConnection(config);
    let insertRecipeSql = `INSERT INTO recipes (user_id, name, category, type, instructions, image, video, prep_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    let recipeData = [user_id, name, category || null, type || null, instructions, image || null, video || null, prep_time];
    console.log('Recipe insert SQL:', insertRecipeSql);
    console.log('data:', recipeData);
    connectionUpload.query(insertRecipeSql, recipeData, (err, result) => {
        if (err) {
            console.error('Error inserting recipe:', err);
            connectionUpload.end();
            return res.status(500).json({ error: "Database error inserting recipe" });
        }
        const recipe_id = result.insertId;
        console.log('Recipe inserted successfully, recipe_id:', recipe_id);
        let ingredientValues = [];
        let ingredientsProcessed = 0;
        ingredients.forEach((ing, index) => {
            let selectIngredientSql = `SELECT ingredient_id FROM ingredients WHERE name = ?`;
            connectionUpload.query(selectIngredientSql, [ing.ingredient_name], (err2, rows) => {
                if (err2 || rows.length === 0) {
                    console.error(`Error fetching ingredient_id for ${ing.ingredient_name}:`, err2);
                    if (ingredientsProcessed === ingredients.length - 1) {
                        return res.status(500).json({ error: "Error processing ingredients" });
                    }
                } else {
                    const ingredient_id = rows[0].ingredient_id;
                    ingredientValues.push([
                        recipe_id,
                        ingredient_id,
                        ing.quantity,
                        ing.quantity_type || null,
                        ing.required
                    ]);
                }
                ingredientsProcessed++;
                if (ingredientsProcessed === ingredients.length) {
                    let insertIngSql = `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_type, required) VALUES ?`;
                    console.log('recipe ingredient list:', ingredientValues);
                    connectionUpload.query(insertIngSql, [ingredientValues], (err3) => {
                        connectionUpload.end();
                        if (err3) {
                            console.error('Error inserting ingredients:', err3);
                            return res.status(500).json({ error: "Database error inserting recipe ingredients" });
                        }
                        res.json({ message: "Recipe uploaded successfully" });
                    });
                }
            });
        });
    });
});

app.put('/api/editRecipe', (req, res) => {
    const {
        user_id,
        recipe_id,
        name,
        category,
        type,
        instructions,
        image,
        video,
        prep_time,
        ingredients
    } = req.body;

    // Validate required fields
    if (!user_id || !recipe_id || !name || !instructions || !prep_time || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const connectionEdit = mysql.createConnection(config);

    // Verify that the recipe exists and belongs to the user
    const verifySql = "SELECT * FROM recipes WHERE recipe_id = ? AND user_id = ?";
    connectionEdit.query(verifySql, [recipe_id, user_id], (err, results) => {
        if (err) {
            connectionEdit.end();
            return res.status(500).json({ error: "Database error during verification" });
        }

        if (results.length === 0) {
            connectionEdit.end();
            return res.status(403).json({ error: "Unauthorized or recipe not found" });
        }

        // Build the update query dynamically based on provided fields
        let updateFields = [];
        let updateValues = [];

        if (name) {
            updateFields.push("name = ?");
            updateValues.push(name);
        }
        if (category) {
            updateFields.push("category = ?");
            updateValues.push(category);
        }
        if (type) {
            updateFields.push("type = ?");
            updateValues.push(type);
        }
        if (instructions) {
            updateFields.push("instructions = ?");
            updateValues.push(instructions);
        }
        if (image) {
            updateFields.push("image = ?");
            updateValues.push(image);
        }
        if (video) {
            updateFields.push("video = ?");
            updateValues.push(video);
        }
        if (prep_time) {
            updateFields.push("prep_time = ?");
            updateValues.push(prep_time);
        }

        updateValues.push(recipe_id);

        const updateSql = `
            UPDATE recipes 
            SET ${updateFields.join(', ')}
            WHERE recipe_id = ?
        `;

        connectionEdit.query(updateSql, updateValues, (err2) => {
            if (err2) {
                connectionEdit.end();
                return res.status(500).json({ error: "Database error updating recipe" });
            }

            // Delete existing ingredients for the recipe
            const deleteIngSql = "DELETE FROM recipe_ingredients WHERE recipe_id = ?";
            connectionEdit.query(deleteIngSql, [recipe_id], (err3) => {
                if (err3) {
                    connectionEdit.end();
                    return res.status(500).json({ error: "Database error deleting old ingredients" });
                }

                // Insert new ingredients
                const insertIngSql = `
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, quantity_type, required)
                    VALUES ?
                `;

                const ingredientValues = ingredients.map(ing => [
                    recipe_id,
                    ing.ingredient_id,
                    ing.quantity,
                    ing.quantity_type || null,
                    ing.required
                ]);

                connectionEdit.query(insertIngSql, [ingredientValues], (err4) => {
                    connectionEdit.end();
                    if (err4) {
                        return res.status(500).json({ error: "Database error inserting new ingredients" });
                    }
                    res.json({ message: "Recipe updated successfully" });
                });
            });
        });
    });
});
  

// Get all recipes uploaded by the user
app.post('/api/getMyRecipes', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }
    let connectionMyRecipes = mysql.createConnection(config);
    let sql = "SELECT * FROM recipes WHERE user_id = ?";
    connectionMyRecipes.query(sql, [user_id], (error, results) => {
        if (error) {
            connectionMyRecipes.end();
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ recipes: results });
        connectionMyRecipes.end();
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

