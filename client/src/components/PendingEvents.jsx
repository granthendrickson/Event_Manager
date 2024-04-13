import React, { useState, useEffect } from 'react';
import moment from 'moment';

// Components
import EventTile from '../components/EventTile';

export default function PendingEvents(props) {
	const { university_id } = props;

	const [pendingEvents, setPendingEvents] = useState([]);

	const fetchPendingEvents = async () => {
		try {
			const response = await fetch(
				`http://localhost:8080/PendingEvents/${university_id}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch pending events');
			}

			const data = await response.json();
			setPendingEvents(data);
		} catch (error) {
			console.error('Error fetching pending events:', error);
		}
	};

	useEffect(() => {
		// Fetch pending events when university_id changes
		if (university_id !== '') {
			fetchPendingEvents();
		}
	}, [university_id]);

	const approveEvent = async (eventId) => {
		try {
			const response = await fetch(
				`http://localhost:8080/Events/approve/${eventId}`,
				{
					method: 'POST',
				}
			);
			if (!response.ok) {
				throw new Error('Failed to approve RSO');
			}
			// Refresh pending RSOs after approval
			fetchPendingEvents();
		} catch (error) {
			console.error('Error approving Event:', error);
		}
	};

	return (
		<div>
			<h2>Pending Events:</h2>
			<div className='events-list'>
				<ul>
					{pendingEvents.map((event, index) => (
						<div
							className='approve-event-container'
							key={index}
						>
							<EventTile
								key={event.event_id}
								event_id={event.event_id}
								name={event.name}
								category={event.category}
								date={moment(event.date).format('DD MMM, YYYY')}
								time={moment(event.time, 'HH:mm').format('LT')}
								contact_email={event.contact_email}
								contact_phone={event.contact_phone}
								description={event.description}
							/>
							<button
								id='approve-event-button'
								onClick={() => approveEvent(event.event_id)}
							>
								Approve Event
							</button>
						</div>
					))}
				</ul>
			</div>
		</div>
	);
}
