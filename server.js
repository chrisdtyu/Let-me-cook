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


// API Routes for Profile
app.get('/api/getDietaryPreferences', (req, res) => {
    let sql = "SELECT preference_id, preference_name FROM dietary_preferences";
    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json(results);
    });
});

app.get('/api/searchDietaryPreferences', (req, res) => {
    const searchQuery = req.query.q;
    let sql = "SELECT * FROM dietary_preferences WHERE preference_name LIKE ?";
    let data = [`%${searchQuery}%`];
    connection.query(sql, data, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json(results);
    });
});

app.get('/api/getIngredients', (req, res) => {
    let sql = "SELECT ingredient_id, name FROM ingredients";
    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        res.json(results);
    });
});

app.post('/api/saveProfile', (req, res) => {
    const { firstName, lastName, email, password, dietaryPreferences, dietaryRestrictions, alwaysAvailable, healthGoals, weeklyBudget } = req.body;
    let userQuery = "INSERT INTO users (first_name, last_name, email, password, health_goals, weekly_budget) VALUES (?, ?, ?, ?, ?, ?)";
    let userData = [firstName, lastName, email, password, healthGoals, weeklyBudget];

    connection.query(userQuery, userData, (err, result) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
            return;
        }
        const userId = result.insertId;

        if (dietaryPreferences.length > 0) {
            let preferenceQuery = "INSERT INTO user_preferences (user_id, preference_id) VALUES ?";
            let preferenceValues = dietaryPreferences.map(pref => [userId, pref]);
            connection.query(preferenceQuery, [preferenceValues], (err) => {
                if (err) console.error("Error saving dietary preferences:", err);
            });
        }

        if (dietaryRestrictions.length > 0) {
            let restrictionQuery = "INSERT INTO user_ingredients (user_id, ingredient_id, is_dietary_restriction) VALUES ?";
            let restrictionValues = dietaryRestrictions.map(restr => [userId, restr, true]);
            connection.query(restrictionQuery, [restrictionValues], (err) => {
                if (err) console.error("Error saving dietary restrictions:", err);
            });
        }

        res.json({ message: "Profile saved successfully!" });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server
