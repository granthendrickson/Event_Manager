import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
const saltRounds = 10;

const pool = mysql
	.createPool({
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
	})
	.promise();

export async function getUsers() {
	const [rows] = await pool.query('SELECT * FROM Users');
	return rows;
}

export async function getUser(id) {
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

export async function createUser(username, password, email, user_level) {
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
		return newUser;
	} catch (error) {
		console.error('Error creating user:', error);
		throw error;
	}
}

export async function login(username, password) {
	const [result] = await pool.query(
		'SELECT * FROM Users WHERE username = ?;',
		username
	);

	if (result == null) {
		return null;
	} else {
		const id = result.userId;
		return getUser(id);
	}
}
