import React, { useState } from 'react';

export default function Register() {
	// Initialize state to store input values
	const [user, setUser] = useState({
		username: '',
		email: '',
		password: '',
		user_level: 'student', // Default value
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
			<div className='registerForm'>
				<h1>Register</h1>
				<div className='inputField'>
					<label>Username:</label>
					<input
						type='text'
						name='username'
						value={user.username}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Email:</label>
					<input
						type='text'
						name='email'
						value={user.email}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					{' '}
					<label>Password:</label>
					<input
						type='text'
						name='password'
						value={user.password}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>User Level:</label>
					<select
						name='user_level'
						value={user.user_level}
						onChange={handleInputChange}
					>
						<option value='student'>Student</option>
						<option value='admin'>Admin</option>
						<option value='super admin'>Super Admin</option>
					</select>
				</div>
				<div className='buttonContainer'>
					<button onClick={handleCreateUser}>Register</button>
				</div>
			</div>
		</div>
	);
}
