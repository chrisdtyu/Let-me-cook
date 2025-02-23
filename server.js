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

app.post('/api/createUser', async (req, res) => {
    let connection = mysql.createConnection(config);
    let { firebase_uid, personalname, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password

        let sql = `INSERT INTO users (firebase_uid, personalname, email, password) VALUES (?, ?, ?, ?)`;
        let data = [firebase_uid, personalname, email, hashedPassword];

        connection.query(sql, data, (error, results) => {
            if (error) {
                console.error(error.message);
                res.status(500).send({ express: JSON.stringify(error) });
                return;
            }
            res.send({ express: JSON.stringify(results) });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ express: "Error processing request" });
    } finally {
        connection.end();
    }
});


app.post('/api/getUser', (req, res) => {
    let connection = mysql.createConnection(config);
    let { firebase_uid} = req.body;

    let sql = `SELECT user_id, personalname, email, password FROM users WHERE firebase_uid = ?`;
    connection.query(sql, [firebase_uid], async (error, results) => {
        if (error) {
            console.error(error.message);
            res.status(500).send({ express: JSON.stringify(error) });
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            res.send({ express: JSON.stringify({ user_id: user.user_id, personalname: user.personalname, email: user.email }) });
        } else {
            res.status(404).send({ express: "User not found" });
        }
    });

    connection.end();
});


app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '172.31.31.77'); //for the deployed version, specify the IP address of the server
