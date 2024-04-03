import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Login() {
	// Initialize state to store input values
	const [user, setUser] = useState({
		username: '',
		password: '',
	});

	const [loginStatus, setLoginStatus] = useState('');

	axios.defaults.withCredentials = true;

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	const handleLogin = async () => {
		try {
			const response = await axios.post(
				'http://localhost:8080/Login',
				user,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			if (response.status !== 200) {
				throw new Error('Failed to Login');
			}
			const LoggedInUser = response.data.user[0];
			setLoginStatus(LoggedInUser.username);
			console.log('Logged in as:', LoggedInUser);
		} catch (error) {
			console.error('Error logging in:', error);
		}
	};

	useEffect(() => {
		axios.get('http://localhost:8080/Login').then((response) => {
			if (response.data.loggedIn === true) {
				setLoginStatus(response.data.user[0].username);
			}
		});
	}, []);

	return (
		<div className='login'>
			<label>Username:</label>
			<input
				type='text'
				name='username'
				value={user.username}
				onChange={handleInputChange}
			/>
			<label>Password:</label>
			<input
				type='text'
				name='password'
				value={user.password}
				onChange={handleInputChange}
			/>
			<button onClick={handleLogin}>Login</button>
			<div className='username'>{loginStatus}</div>
		</div>
	);
}
