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
	console.log(sql);
	let data = [formData.first_name,formData.last_name,formData.email,formData.password];
	console.log(data);

	connection.query(sql, data, (error, results, fields) => {
		console.log("hello world!", error, results, fields);
		if (error) {
			return console.error(error.message);
		}
		console.log(results);
		let string = JSON.stringify(results);
		console.log(string);
		//let obj = JSON.parse(string);
		res.send({ express: string });
	});
	connection.end();
});


app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server
