import React, { useState, useEffect } from 'react';

export default function PendingRSOs(props) {
	const { university_id } = props;

	const [pendingRSOs, setPendingRSOs] = useState(null);

	useEffect(() => {
		const fetchPendingRSOs = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/RSOs/pending/${university_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch pending RSOs');
				}
				const data = await response.json();
				setPendingRSOs(data);
			} catch (error) {
				console.error('Error fetching pending RSOs:', error);
			}
		};

		fetchPendingRSOs();
	}, [university_id]);

	return (
		<div>
			{pendingRSOs ? (
				<div>
					<h2>Pending RSOs</h2>
					<ul>
						{pendingRSOs.map((rso) => (
							<li key={rso.rso_id}>{rso.name}</li>
						))}
					</ul>
				</div>
			) : (
				<p>Loading pending RSOs...</p>
			)}
		</div>
	);
}
