import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';

import bcrypt from 'bcrypt';
const saltRounds = 10;

dotenv.config();

const app = express();

app.use(express.json());

// Enable CORS
app.use(
	cors({
		origin: 'http://localhost:3000', // Allow requests from the origin where your React app is hosted
		methods: ['GET', 'POST'], // Allow only specified methods
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers
	})
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		key: 'user_id',
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			expires: 60 * 60 * 24,
		},
	})
);

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

app.get('/Login', (req, res) => {
	if (req.session.user) {
		res.send({ loggedIn: true, user: req.session.user });
	} else {
		res.send({ loggedIn: false });
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
				req.session.user = result;
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

app.post('/Events', async (req, res) => {
	const {
		name,
		category,
		description,
		time,
		date,
		location_id,
		contact_phone,
		contact_email,
		visibility,
		approval_status,
		rso_id,
		university_id,
	} = req.body;

	try {
		const [result] = await pool.query(
			`INSERT INTO Events (name, category, description, time, date, location_id, contact_phone, contact_email, visibility, approval_status, rso_id, university_id)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				name,
				category,
				description,
				time,
				date,
				location_id,
				contact_phone,
				contact_email,
				visibility,
				approval_status,
				rso_id,
				university_id,
			]
		);

		const eventId = result.insertId;

		const newEvent = await getEvent(eventId);
		res.status(201).send(newEvent);
	} catch (error) {
		console.error('Error creating event:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/UserEvents/:user_id', async (req, res) => {
	const user_id = req.params.user_id;

	try {
		// Retrieve the user's university_id
		const user = await getUser(user_id);
		const university_id = user.university_id;

		// Fetch events with public or private visibility and matching university_id
		const [events] = await pool.query(
			`SELECT * FROM Events WHERE visibility = 'public' OR (visibility = 'private' AND university_id = ?)`,
			[university_id]
		);

		res.send(events);
	} catch (error) {
		console.error('Error fetching user events:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

async function getEvent(eventId) {
	const [rows] = await pool.query(`SELECT * FROM Events WHERE event_id = ?`, [
		eventId,
	]);
	return rows[0];
}

app.post('/Universities', async (req, res) => {
	const { name, location, description, number_of_students, pictures } =
		req.body;

	try {
		const [result] = await pool.query(
			`INSERT INTO Universities (name, location, description, number_of_students, pictures)
							VALUES (?, ?, ?, ?, ?)`,
			[name, location, description, number_of_students, pictures]
		);

		const universityId = result.insertId;

		const newUniversity = await getUniversity(universityId);
		res.status(201).send(newUniversity);
	} catch (error) {
		console.error('Error creating university:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

async function getUniversity(id) {
	const [rows] = await pool.query(
		`SELECT *
			FROM Universities
			WHERE university_id = ?`,
		[id]
	);
	return rows[0];
}

app.post('/RSOs', async (req, res) => {
	const { name, admin_id, university_id } = req.body;

	try {
		const [result] = await pool.query(
			`INSERT INTO RSOs (name, admin_id, university_id)
							VALUES (?, ?, ?)`,
			[name, admin_id, university_id]
		);

		const rsoId = result.insertId;

		const newRSO = await getRSO(rsoId);
		res.status(201).send(newRSO);
	} catch (error) {
		console.error('Error creating RSO:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/Locations', async (req, res) => {
	const { name, latitude, longitude } = req.body;

	try {
		const [result] = await pool.query(
			`INSERT INTO Locations (name, latitude, longitude)
							VALUES (?, ?, ?)`,
			[name, latitude, longitude]
		);

		const locationId = result.insertId;

		const newLocation = await getLocation(locationId);
		res.status(201).send(newLocation);
	} catch (error) {
		console.error('Error creating location:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

async function getLocation(id) {
	const [rows] = await pool.query(
		`SELECT *
			FROM Locations
			WHERE location_id = ?`,
		[id]
	);
	return rows[0];
}

async function getRSO(id) {
	const [rows] = await pool.query(
		`SELECT *
			FROM RSOs
			WHERE rso_id = ?`,
		[id]
	);
	return rows[0];
}

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
