import mysql from 'mysql';
import config from './config.js';
import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import response from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));


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

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server
