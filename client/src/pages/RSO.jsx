import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function RSO() {
	const location = useLocation();
	const user = location.state.user;
	const RSO = location.state.RSO;
	const [university, setUniversity] = useState(null);
	const [isMember, setIsMember] = useState(false); // New state to track membership status

	useEffect(() => {
		const fetchUniversity = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/Universities/${RSO.university_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch university');
				}
				const data = await response.json();
				setUniversity(data);
			} catch (error) {
				console.error('Error fetching university:', error);
			}
		};

		fetchUniversity();
	}, [RSO.university_id]);

	useEffect(() => {
		const checkMembership = async () => {
			try {
				const response = await fetch(
					'http://localhost:8080/UserRSOMemberships/check',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							user_id: user.user_id,
							rso_id: RSO.rso_id,
						}),
					}
				);

				if (!response.ok) {
					throw new Error('Failed to check membership');
				}

				const data = await response.json();
				setIsMember(data.exists);
			} catch (error) {
				console.error('Error checking membership:', error);
			}
		};

		checkMembership();
	}, [user.user_id, RSO.rso_id]);

	const handleJoinRSO = async () => {
		try {
			const response = await fetch(
				'http://localhost:8080/UserRSOMemberships',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						user_id: user.user_id,
						rso_id: RSO.rso_id,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to join RSO');
			}

			setIsMember(true); // Update local state to reflect membership
		} catch (error) {
			console.error('Error joining RSO:', error);
		}
	};

	const handleLeaveRSO = async () => {
		try {
			const response = await fetch(
				`http://localhost:8080/UserRSOMemberships/${user.user_id}/${RSO.rso_id}`,
				{
					method: 'DELETE',
				}
			);

			if (!response.ok) {
				throw new Error('Failed to leave RSO');
			}

			setIsMember(false); // Update local state to reflect non-membership
		} catch (error) {
			console.error('Error leaving RSO:', error);
		}
	};

	return (
		<div>
			<h1>{RSO.name}</h1>
			{university && (
				<div>
					<h2>
						{university.name} - {university.location}
					</h2>
					{/* Add other university information here */}
				</div>
			)}
			{user.user_id !== RSO.admin_id && (
				<div className='membership-button-container'>
					{isMember ? (
						<button onClick={handleLeaveRSO}>Leave</button>
					) : (
						<button onClick={handleJoinRSO}>Join</button>
					)}
				</div>
			)}
		</div>
	);
}
