import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EventTile(props) {
	const {
		event_id,
		name,
		category,
		date,
		time,
		location_id,
		contact_email,
		contact_phone,
		description,
		rso_id,
		university_id,
		user,
	} = props;

	const [userAndEvent, setUserAndEvent] = useState(null);

	const navigate = useNavigate();
	const toEventPage = (userAndEvent) => {
		navigate('../pages/Event.jsx', { state: userAndEvent });
	};

	const handleNavigationToEventPage = async () => {
		toEventPage(userAndEvent);
	};

	useEffect(() => {
		const temp = { user, event_id };
		setUserAndEvent(temp);
	}, [user, event_id]);

	return (
		<div
			className='event_tile'
			onClick={handleNavigationToEventPage}
		>
			<div className='event-tile-name-and-details'>
				<h1 className='event-tile-name'>{name}</h1>

				<h3>Details:</h3>
				<div>Category: {category}</div>
				<div>Date: {date}</div>
				<div>Time: {time}</div>
				<div>Location: 123 Street st.</div>
			</div>

			<div className='event-tile-description-and-contact-info'>
				<div className='event-tile-contact-info'>
					<h3>Contact:</h3>
					<div className='event-tile-email'>
						Email: {contact_email}
					</div>
					<div className='event-tile-phone'>
						Phone: {contact_phone}
					</div>
				</div>

				<div className='event-tile-description'>{description}</div>
			</div>
		</div>
	);
}
