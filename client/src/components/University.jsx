import React, { useState, useEffect } from 'react';

// Components
import PendingRSOs from './PendingRSOs';

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
		<div className='university'>
			{university && (
				<div>
					<h2>
						{university.name} - {university.location}
					</h2>
					<p>{university.description}</p>
					{/* Add more details as needed */}
					<PendingRSOs university_id={university_id} />
				</div>
			)}
		</div>
	);
}
