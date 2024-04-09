import React, { useState, useEffect } from 'react';

export default function University(props) {
	const { university_id } = props;

	const [university, setUniversity] = useState(null);

	useEffect(() => {
		const fetchUniversity = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/Universities/${university_id}`
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

		if (university_id) {
			fetchUniversity();
		}
	}, [university_id]);

	return (
		<div>
			{university && (
				<div>
					<h2>{university.name}</h2>
					<p>Location: {university.location}</p>
					<p>Description: {university.description}</p>
					{/* Add more details as needed */}
				</div>
			)}
		</div>
	);
}
