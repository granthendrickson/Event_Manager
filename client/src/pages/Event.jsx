import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';

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
					<p>Date: {moment(event.date).format('DD MMM, YYYY')}</p>
					<p>Time: {moment(event.time, 'HH:mm').format('LT')}</p>
					<p>Email: {event.contact_email}</p>
					<p>Phone: {event.contact_phone}</p>
				</div>
			) : (
				<p>Loading event...</p>
			)}
		</div>
	);
}
