import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

app.use(express.json());

// Enable CORS
app.use(
	cors({
		origin: 'http://localhost:3000', // Allow requests from the origin where your React app is hosted
		methods: ['GET', 'POST'], // Allow only specified methods
		allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers
	})
);

const saltRounds = 10;

const pool = mysql
	.createPool({
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
	})
	.promise();

app.get('/Users', async (req, res) => {
	const users = await getUsers();
	res.send(users);
});

app.get('/Users/:user_id', async (req, res) => {
	const user_id = req.params.user_id;
	const user = await getUser(user_id);
	res.send(user);
});

app.post('/Register', async (req, res) => {
	const { username, password, email, user_level } = req.body;

	try {
		const hash = await bcrypt.hash(password, saltRounds);

		const [result] = await pool.query(
			`
                    INSERT INTO Users (username, password, email, user_level)
                    VALUES (?,?,?,?)
                    `,
			[username, hash, email, user_level]
		);

		const id = result.insertId;

		const newUser = await getUser(id);
		res.status(201).send(newUser);
	} catch (error) {
		// Check if the error is due to duplicate username
		if (error.code === 'ER_DUP_ENTRY') {
			console.error('Username already exists:', username);
			res.status(400).send({ error: 'Username already exists' });
		} else {
			console.error('Error creating user:', error);
			res.status(500).send({ error: 'Internal server error' });
		}
	}
});

app.post('/Login', async (req, res) => {
	const { username, password } = req.body;

	try {
		const [result] = await pool.query(
			'SELECT * FROM Users WHERE username = ?;',
			username
		);

		if (result.length > 0) {
			const match = await bcrypt.compare(password, result[0].password);
			if (match) {
				res.send(result);
			} else {
				res.send({ message: 'Wrong username/password combination!' });
			}
		} else {
			res.send({ message: "User doesn't exist!" });
		}
	} catch (error) {
		console.error('Error logging in:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

async function getUsers() {
	const [rows] = await pool.query('SELECT * FROM Users');
	return rows;
}

async function getUser(id) {
	const [rows] = await pool.query(
		`
    SELECT *
    FROM Users
    WHERE user_id = ?
    `,
		[id]
	);
	return rows[0];
}

app.listen(8080, () => {
	console.log('Server is running on port 8080...');
});
