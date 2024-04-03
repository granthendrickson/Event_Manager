import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Student() {
	const location = useLocation();
	const user = location.state;
	const [events, setEvents] = useState([]);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/UserEvents/${user.user_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch events');
				}
				const data = await response.json();
				setEvents(data);
			} catch (error) {
				console.error('Error fetching events:', error);
			}
		};

		fetchEvents();
	}, [user.user_id]);

	return (
		<div className='student-page'>
			<h1>{user.username}</h1>
			<h2>Events:</h2>
			<ul>
				{events.map((event) => (
					<li key={event.event_id}>{event.name}</li>
				))}
			</ul>
		</div>
	);
}
