import express from 'express';
import cors from 'cors';
import { getUser, getUsers, createUser } from './database.js';

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

	const user = await createUser(username, password, email, user_level);
	console.log(user);
	res.status(201).send(user);
});

app.listen(8080, () => {
	console.log('Server is running on port 8080...');
});
