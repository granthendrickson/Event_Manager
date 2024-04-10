import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Event() {
	const location = useLocation();
	const [event, setEvent] = useState(null);
	const event_id = location.state;

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/Events/${event_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch event');
				}
				const eventData = await response.json();
				setEvent(eventData);
			} catch (error) {
				console.error('Error fetching event:', error);
			}
		};

		if (event_id) {
			fetchEvent();
		}
	}, [event_id]);

	return (
		<div>
			{event ? (
				<div>
					<h2>{event.name}</h2>
					<p>Category: {event.category}</p>
					<p>Description: {event.description}</p>
					{/* Add more event details here */}
				</div>
			) : (
				<p>Loading event...</p>
			)}
		</div>
	);
}
