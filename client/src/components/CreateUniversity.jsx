import React, { useState } from 'react';

export default function CreateUniversity(props) {
	const { user_id } = props;

	// Initialize state to store input values
	const [university, setUniversity] = useState({
		name: '',
		location: '',
		description: '',
		number_of_students: '',
	});

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUniversity({ ...university, [name]: value });
	};

	const handleCreateUniversity = async () => {
		try {
			const response = await fetch('http://localhost:8080/Universities', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(university),
			});
			if (!response.ok) {
				throw new Error('Failed to create university');
			}
			const newUniversity = await response.json();
			console.log('New university created:', newUniversity);

			// Update user with university_id
			const updateUserResponse = await fetch(
				`http://localhost:8080/Users/${user_id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						university_id: newUniversity.university_id,
					}),
				}
			);
			if (!updateUserResponse.ok) {
				throw new Error('Failed to update user with university_id');
			}
			const updatedUser = await updateUserResponse.json();
			console.log('User updated with university_id:', updatedUser);
		} catch (error) {
			console.error('Error creating university or updating user:', error);
		}
	};

	return (
		<div className='createUniversity'>
			<div className='createUniversityForm'>
				<h1>Create University</h1>
				<div className='inputField'>
					<label>Name:</label>
					<input
						type='text'
						name='name'
						value={university.name}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Location:</label>
					<input
						type='text'
						name='location'
						value={university.location}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Description:</label>
					<textarea
						name='description'
						value={university.description}
						onChange={handleInputChange}
					></textarea>
				</div>
				<div className='inputField'>
					<label>Number of Students:</label>
					<textarea
						name='description'
						value={university.number_of_students}
						onChange={handleInputChange}
					></textarea>
				</div>
				<div className='buttonContainer'>
					<button onClick={handleCreateUniversity}>
						Create University
					</button>
				</div>
			</div>
		</div>
	);
}
