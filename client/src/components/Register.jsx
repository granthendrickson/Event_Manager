import React, { useState } from 'react';

export default function Register() {
	// Initialize state to store input values
	const [user, setUser] = useState({
		username: '',
		email: '',
		password: '',
		userLevel: 'Student', // Default value
	});

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUser({ ...user, [name]: value });
	};

	// Function to handle button click
	const handlePrintDetails = () => {
		console.log(user);
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
				value={user.userLevel}
				onChange={handleInputChange}
			>
				<option value='Student'>Student</option>
				<option value='Admin'>Admin</option>
				<option value='Super Admin'>Super Admin</option>
			</select>
			<button onClick={handlePrintDetails}>Print Details</button>
		</div>
	);
}
