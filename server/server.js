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
		methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow only specified methods
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
	const { username, password, email, user_level, university_id } = req.body;

	try {
		const hash = await bcrypt.hash(password, saltRounds);

		const [result] = await pool.query(
			`
                    INSERT INTO Users (username, password, email, user_level, university_id)
                    VALUES (?,?,?,?,?)
                    `,
			[username, hash, email, user_level, university_id]
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

// Update user information
app.put('/Users/:user_id', async (req, res) => {
	const user_id = req.params.user_id;
	const { university_id } = req.body;

	try {
		// Update the user's university_id in the database
		await pool.query(
			`UPDATE Users
					 SET university_id = ?
					 WHERE user_id = ?`,
			[university_id, user_id]
		);

		// Fetch the updated user from the database
		const updatedUser = await getUser(user_id);

		// Send the updated user as the response
		res.status(200).send(updatedUser);
	} catch (error) {
		console.error('Error updating user:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/GetUserIDByEmail/:email', async (req, res) => {
	const email = req.params.email;

	try {
		const [result] = await pool.query(
			'SELECT user_id FROM Users WHERE email = ?',
			[email]
		);
		if (result.length > 0) {
			res.send({ exists: true, user_id: result[0].user_id });
		} else {
			res.send({ exists: false, user_id: null });
		}
	} catch (error) {
		console.error('Error fetching user ID by email:', error);
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

app.get('/Events/:event_id', async (req, res) => {
	const eventId = req.params.event_id;

	try {
		const event = await getEvent(eventId);
		if (!event) {
			return res.status(404).send({ error: 'Event not found' });
		}
		res.send(event);
	} catch (error) {
		console.error('Error fetching event:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/UserEvents/:user_id', async (req, res) => {
	const user_id = req.params.user_id;

	try {
		// Retrieve the user's university_id
		const user = await getUser(user_id);
		const university_id = user.university_id;

		// Fetch events that the user has access to
		const [events] = await pool.query(
			`SELECT * FROM Events 
				WHERE ((visibility = 'public' AND approval_status = 'approved') OR 
						(visibility = 'private' AND university_id = ?) OR 
						(visibility = 'rso' AND EXISTS 
								(SELECT 1 FROM UserRSOMemberships 
								WHERE user_id = ? AND rso_id = Events.rso_id)) OR 
						(visibility = 'rso' AND EXISTS 
								(SELECT 1 FROM RSOs 
								WHERE admin_id = ? AND rso_id = Events.rso_id)))`,
			[university_id, user_id, user_id]
		);

		res.send(events);
	} catch (error) {
		console.error('Error fetching user events:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/PendingEvents/:university_id', async (req, res) => {
	const universityId = req.params.university_id;

	try {
		// Fetch events with the specified university_id and approval_status of "pending"
		const [pendingEvents] = await pool.query(
			`SELECT * FROM Events WHERE university_id = ? AND approval_status = 'pending'`,
			[universityId]
		);

		res.send(pendingEvents);
	} catch (error) {
		console.error('Error fetching pending events:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/Events/approve/:event_id', async (req, res) => {
	const eventId = req.params.event_id;

	try {
		// Update the approval status of the RSO to "approved"
		await pool.query(
			`UPDATE Events
					 SET approval_status = 'approved'
					 WHERE event_id = ?`,
			[eventId]
		);

		res.sendStatus(200);
	} catch (error) {
		console.error('Error approving Event:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

async function getEvent(eventId) {
	const [rows] = await pool.query(`SELECT * FROM Events WHERE event_id = ?`, [
		eventId,
	]);
	return rows[0];
}

app.get('/Universities', async (req, res) => {
	try {
		const [universities] = await pool.query('SELECT * FROM Universities');
		res.send(universities);
	} catch (error) {
		console.error('Error fetching universities:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/Universities/:university_id', async (req, res) => {
	try {
		const universityId = req.params.university_id;
		const [university] = await pool.query(
			'SELECT * FROM Universities WHERE university_id = ?',
			[universityId]
		);
		if (university.length === 0) {
			return res.status(404).send({ error: 'University not found' });
		}
		res.send(university[0]);
	} catch (error) {
		console.error('Error fetching university:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

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

app.get('/RSOs/:userId', async (req, res) => {
	const { userId } = req.params;

	try {
		// Query the database to retrieve RSOs with admin_id equal to userId
		const [rsoRows] = await pool.query(
			'SELECT DISTINCT RSOs.* FROM RSOs LEFT JOIN UserRSOMemberships ON RSOs.rso_id = UserRSOMemberships.rso_id WHERE (RSOs.admin_id = ? OR UserRSOMemberships.user_id = ?) AND RSOs.approval_status = "approved"',
			[userId, userId]
		);

		// Check if any RSOs were found
		if (rsoRows.length === 0) {
			return res
				.status(404)
				.json({ message: 'No RSOs found for the provided user ID' });
		}

		// Send the RSOs as a response
		res.status(200).json({ rsoList: rsoRows });
	} catch (error) {
		console.error('Error retrieving RSOs:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/RSOs/admin/:userId', async (req, res) => {
	const { userId } = req.params;

	try {
		// Query the database to retrieve RSOs with admin_id equal to userId
		const [rsoRows] = await pool.query(
			'SELECT * FROM RSOs WHERE admin_id = ?',
			[userId]
		);

		// Check if any RSOs were found
		if (rsoRows.length === 0) {
			return res
				.status(404)
				.json({ message: 'No RSOs found for the provided user ID' });
		}

		// Send the RSOs as a response
		res.status(200).json({ rsoList: rsoRows });
	} catch (error) {
		console.error('Error retrieving RSOs:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/RSOs/pending/:university_id', async (req, res) => {
	const universityId = req.params.university_id;

	try {
		const [rsoList] = await pool.query(
			`SELECT * FROM RSOs WHERE university_id = ? AND approval_status = 'pending'`,
			[universityId]
		);
		res.send(rsoList);
	} catch (error) {
		console.error('Error fetching pending RSOs:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/RSOs/approved/:university_id', async (req, res) => {
	const universityId = req.params.university_id;

	try {
		const [rsoList] = await pool.query(
			`SELECT * FROM RSOs WHERE university_id = ? AND approval_status = 'approved'`,
			[universityId]
		);
		res.send(rsoList);
	} catch (error) {
		console.error('Error fetching pending RSOs:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/RSOs/approve/:rsoId', async (req, res) => {
	const rsoId = req.params.rsoId;
	const adminId = req.body.adminId; // Access adminId from req.body.adminId

	try {
		// Update the approval status of the RSO to "approved"
		await pool.query(
			`UPDATE RSOs
					 SET approval_status = 'approved'
					 WHERE rso_id = ?`,
			[rsoId]
		);

		// Update the user_level of the admin user to 'admin'
		await pool.query(
			`UPDATE Users
			 SET user_level = 'admin'
			 WHERE user_id = ?`,
			[adminId]
		);

		res.sendStatus(200);
	} catch (error) {
		console.error('Error approving RSO:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/UserRSOMemberships', async (req, res) => {
	const { user_id, rso_id } = req.body;

	try {
		// Check if the user and RSO exist
		const [userResult] = await pool.query(
			'SELECT * FROM Users WHERE user_id = ?',
			[user_id]
		);
		const [rsoResult] = await pool.query(
			'SELECT * FROM RSOs WHERE rso_id = ?',
			[rso_id]
		);

		if (userResult.length === 0) {
			return res.status(404).send({ error: 'User not found' });
		}

		if (rsoResult.length === 0) {
			return res.status(404).send({ error: 'RSO not found' });
		}

		// Check if the membership already exists
		const [existingMembership] = await pool.query(
			'SELECT * FROM UserRSOMemberships WHERE user_id = ? AND rso_id = ?',
			[user_id, rso_id]
		);

		if (existingMembership.length > 0) {
			return res.status(400).send({ error: 'Membership already exists' });
		}

		// Create the membership
		await pool.query(
			'INSERT INTO UserRSOMemberships (user_id, rso_id) VALUES (?, ?)',
			[user_id, rso_id]
		);

		res.status(201).send({
			message: 'UserRSOMembership created successfully',
		});
	} catch (error) {
		console.error('Error creating UserRSOMembership:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/UserRSOMemberships/check', async (req, res) => {
	const { user_id, rso_id } = req.body;

	try {
		// Check if the UserRSOMembership exists
		const [membership] = await pool.query(
			'SELECT * FROM UserRSOMemberships WHERE user_id = ? AND rso_id = ?',
			[user_id, rso_id]
		);

		if (membership.length > 0) {
			// UserRSOMembership exists
			res.status(200).send({ exists: true });
		} else {
			// UserRSOMembership does not exist
			res.status(200).send({ exists: false });
		}
	} catch (error) {
		console.error('Error checking UserRSOMembership:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.delete('/UserRSOMemberships/:user_id/:rso_id', async (req, res) => {
	const { user_id, rso_id } = req.params;

	try {
		// Delete the UserRSOMembership
		await pool.query(
			'DELETE FROM UserRSOMemberships WHERE user_id = ? AND rso_id = ?',
			[user_id, rso_id]
		);

		res.status(200).send({
			message: 'UserRSOMembership deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting UserRSOMembership:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/Locations', async (req, res) => {
	const { name, latitude, longitude } = req.body;

	try {
		// Check if the location already exists
		const [existingLocation] = await pool.query(
			'SELECT * FROM Locations WHERE name = ?',
			[name]
		);

		if (existingLocation.length > 0) {
			// If the location already exists, return it
			res.status(200).send(existingLocation[0]);
			return;
		}

		// If the location doesn't exist, insert it into the database
		const [result] = await pool.query(
			`INSERT INTO Locations (name, latitude, longitude)
							VALUES (?, ?, ?)`,
			[name, latitude, longitude]
		);

		const locationId = result.insertId;

		const newLocation = await getLocation(locationId);
		res.status(201).send(newLocation);
	} catch (error) {
		console.error('Error creating or fetching location:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/Locations/:location_id', async (req, res) => {
	const { location_id } = req.params;

	try {
		// Fetch the location from the database based on location_id
		const [location] = await pool.query(
			'SELECT * FROM Locations WHERE location_id = ?',
			[location_id]
		);

		// Check if the location exists
		if (location.length === 0) {
			return res.status(404).send({ error: 'Location not found' });
		}

		// Return the location
		res.status(200).send(location[0]);
	} catch (error) {
		console.error('Error fetching location:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.post('/Comments', async (req, res) => {
	const { event_id, user_id, comment_text } = req.body;

	// Check if all required fields are present
	if (!event_id || !user_id || !comment_text) {
		return res.status(400).send({
			error: 'All fields (event_id, user_id, comment_text) are required',
		});
	}

	try {
		// Insert the new comment into the database
		const [result] = await pool.query(
			`INSERT INTO Comments (event_id, user_id, comment_text, timestamp) VALUES (?, ?, ?, NOW())`,
			[event_id, user_id, comment_text]
		);

		const commentId = result.insertId;

		// Retrieve the newly created comment
		const newComment = await getComment(commentId);

		// Send the newly created comment as the response
		res.status(201).send(newComment);
	} catch (error) {
		console.error('Error creating comment:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.put('/Comments/:comment_id', async (req, res) => {
	const commentId = req.params.comment_id;
	const { comment_text } = req.body;

	try {
		// Update the comment text in the database
		await pool.query(
			`UPDATE Comments
					 SET comment_text = ?
					 WHERE comment_id = ?`,
			[comment_text, commentId]
		);

		// Retrieve the updated comment
		const updatedComment = await getComment(commentId);

		// Send the updated comment as the response
		res.send(updatedComment);
	} catch (error) {
		console.error('Error updating comment:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

app.get('/Comments/:event_id', async (req, res) => {
	const eventId = req.params.event_id;

	try {
		const [comments] = await pool.query(
			`SELECT * FROM Comments WHERE event_id = ?`,
			[eventId]
		);
		res.send(comments);
	} catch (error) {
		console.error('Error fetching comments:', error);
		res.status(500).send({ error: 'Internal server error' });
	}
});

async function getComment(commentId) {
	const [rows] = await pool.query(
		`SELECT * FROM Comments WHERE comment_id = ?`,
		[commentId]
	);
	return rows[0];
}

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
