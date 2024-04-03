import React, { useState } from 'react';

export default function Register() {
	// Initialize state to store input values
	const [user, setUser] = useState({
		username: '',
		email: '',
		password: '',
		user_level: 'Student', // Default value
	});

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	const handleCreateUser = async () => {
		try {
			const response = await fetch('http://localhost:8080/Register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(user),
			});
			if (!response.ok) {
				throw new Error('Failed to create user');
			}
			const newUser = await response.json();
			console.log('New user created:', newUser);
		} catch (error) {
			console.error('Error creating user:', error);
		}
	};

	return (
		<div className='register'>
			<label>Username:</label>
			<input
				type='text'
				name='username'
				value={user.username}
				onChange={handleInputChange}
			/>
			<label>Email:</label>
			<input
				type='text'
				name='email'
				value={user.email}
				onChange={handleInputChange}
			/>
			<label>Password:</label>
			<input
				type='text'
				name='password'
				value={user.password}
				onChange={handleInputChange}
			/>
			<label>User Level:</label>
			<select
				name='userLevel'
				value={user.user_level}
				onChange={handleInputChange}
			>
				<option value='Student'>Student</option>
				<option value='Admin'>Admin</option>
				<option value='Super Admin'>Super Admin</option>
			</select>
			<button onClick={handleCreateUser}>Print Details</button>
		</div>
	);
}
