import React, { useState } from 'react';

export default function Login() {
	// Initialize state to store input values
	const [user, setUser] = useState({
		username: '',
		password: '',
	});

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	const handleLogin = async () => {
		try {
			const response = await fetch('http://localhost:8080/Login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(user),
			});
			if (!response.ok) {
				throw new Error('Failed to Login');
			}
			const LoggedInUser = await response.json();
			console.log('Logged in as:', LoggedInUser);
		} catch (error) {
			console.error('Error loggin in:', error);
		}
	};

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
		</div>
	);
}
