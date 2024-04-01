import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config();

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
	const [result] = await pool.query(
		`
  INSERT INTO Users (username, password, email, user_level)
  VALUES (?,?,?,?)
  `,
		[username, password, email, user_level]
	);

	const id = result.insertId;

	return getUser(id);
}
