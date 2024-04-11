import React, { useState, useEffect } from 'react';

export default function CreateRSO() {
	// Initialize state to store input values
	const [RSO, setRSO] = useState({
		name: '',
		admin_id: '',
		admin_email: '',
		student1_email: '',
		student2_email: '',
		student3_email: '',
	});

	const [universities, setUniversities] = useState([]);

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setRSO({ ...RSO, [name]: value });
	};

	useEffect(() => {
		const fetchUniversities = async () => {
			try {
				const response = await fetch(
					'http://localhost:8080/Universities'
				);
				if (!response.ok) {
					throw new Error('Failed to fetch universities');
				}
				const data = await response.json();
				setUniversities(data);
			} catch (error) {
				console.error('Error fetching universities:', error);
			}
		};
		fetchUniversities();
	}, []);

	const handleCreateRSO = async () => {
		try {
			// Get user IDs by email for admin
			const adminExistenceResponse = await fetch(
				`http://localhost:8080/GetUserIDByEmail/${RSO.admin_email}`
			);
			const adminData = await adminExistenceResponse.json();
			const adminExists = adminData.exists;
			const adminUserId = adminData.user_id;
			if (!adminExists) {
				return console.error('Admin user not found');
			}

			// Get user IDs by email for student 1
			const student1ExistenceResponse = await fetch(
				`http://localhost:8080/GetUserIDByEmail/${RSO.student1_email}`
			);
			const student1Data = await student1ExistenceResponse.json();
			const student1Exists = student1Data.exists;
			const student1UserId = student1Data.user_id;
			if (!student1Exists) {
				return console.error('Student 1 not found');
			}

			// Get user IDs by email for student 2
			const student2ExistenceResponse = await fetch(
				`http://localhost:8080/GetUserIDByEmail/${RSO.student2_email}`
			);
			const student2Data = await student2ExistenceResponse.json();
			const student2Exists = student2Data.exists;
			const student2UserId = student2Data.user_id;
			if (!student2Exists) {
				return console.error('Student 2 not found');
			}

			// Get user IDs by email for student 3
			const student3ExistenceResponse = await fetch(
				`http://localhost:8080/GetUserIDByEmail/${RSO.student3_email}`
			);
			const student3Data = await student3ExistenceResponse.json();
			const student3Exists = student3Data.exists;
			const student3UserId = student3Data.user_id;
			if (!student3Exists) {
				return console.error('Student 3 not found');
			}

			// Create the RSO
			const response = await fetch('http://localhost:8080/RSOs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: RSO.name,
					admin_id: adminUserId,
					university_id: RSO.university_id,
				}),
			});
			if (!response.ok) {
				throw new Error('Failed to create RSO');
			}
			const newRSO = await response.json();
			console.log('New RSO created:', newRSO);

			// Create UserRSOMemberships
			const student1MembershipResponse = await fetch(
				'http://localhost:8080/UserRSOMemberships',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: student1UserId,
						rso_id: newRSO.rso_id,
					}),
				}
			);
			if (!student1MembershipResponse.ok) {
				throw new Error('Failed to create Student 1 UserRSOMembership');
			}
			console.log('Student 1 UserRSOMembership created');

			const student2MembershipResponse = await fetch(
				'http://localhost:8080/UserRSOMemberships',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: student2UserId,
						rso_id: newRSO.rso_id,
					}),
				}
			);
			if (!student2MembershipResponse.ok) {
				throw new Error('Failed to create Student 2 UserRSOMembership');
			}
			console.log('Student 2 UserRSOMembership created');

			const student3MembershipResponse = await fetch(
				'http://localhost:8080/UserRSOMemberships',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: student3UserId,
						rso_id: newRSO.rso_id,
					}),
				}
			);
			if (!student3MembershipResponse.ok) {
				throw new Error('Failed to create Student 3 UserRSOMembership');
			}
			console.log('Student 3 UserRSOMembership created');
		} catch (error) {
			console.error('Error creating RSO and memberships:', error);
		}
	};

	return (
		<div className='create-rso'>
			<div className='create-rso-form'>
				<h1>Request to Create RSO:</h1>
				<div className='inputField'>
					<label>Name:</label>
					<input
						type='text'
						name='name'
						value={RSO.name}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Admin Email:</label>
					<input
						type='text'
						name='admin_email'
						value={RSO.admin_email}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Student 1 Email:</label>
					<input
						type='text'
						name='student1_email'
						value={RSO.student1_email}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Student 2 Email:</label>
					<input
						type='text'
						name='student2_email'
						value={RSO.student2_email}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Student 3 Email:</label>
					<input
						type='text'
						name='student3_email'
						value={RSO.student3_email}
						onChange={handleInputChange}
					/>
				</div>
				<div className='buttonContainer'>
					<button
						id='create-rso-button'
						onClick={handleCreateRSO}
					>
						Create RSO
					</button>
				</div>
			</div>
		</div>
	);
}
