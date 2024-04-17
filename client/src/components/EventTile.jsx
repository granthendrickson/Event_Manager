import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons
import locationPing from '../img/locationPing.png';
import phoneIcon from '../img/phoneIcon.png';
import mailIcon from '../img/mailIcon.png';

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
	const [location, setLocation] = useState(null);
	const navigate = useNavigate();

	const toEventPage = (userAndEvent) => {
		navigate('../pages/Event.jsx', { state: userAndEvent });
	};

	const handleNavigationToEventPage = async () => {
		toEventPage(userAndEvent);
	};

	useEffect(() => {
		const fetchLocation = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/Locations/${location_id}`
				);

				if (!response.ok) {
					throw new Error('Failed to fetch location');
				}

				const data = await response.json();
				setLocation(data);
			} catch (error) {
				console.error('Error fetching location:', error);
			}
		};

		fetchLocation();
	}, [location_id]);

	useEffect(() => {
		const temp = { user, event_id };
		setUserAndEvent(temp);
	}, [user, event_id]);

	return (
		<div
			className='event-tile'
			onClick={handleNavigationToEventPage}
		>
			<div className='event-tile-name-and-category'>
				<h1 className='event-tile-name'>{name}</h1>
				<div className='event-tile-category'>{category}</div>
			</div>

			<div className='event-tile-date-and-time'>
				{date} at {time}
			</div>

			<div className='event-tile-location-container'>
				<img
					src={locationPing}
					alt=''
				/>
				<div className='event-tile-location'>
					Location: {location ? location.name : 'Loading...'}
				</div>
			</div>

			<div className='event-tile-description-and-contact-info'>
				<div className='event-tile-contact-info'>
					<div className='event-tile-phone-container'>
						<img
							src={phoneIcon}
							alt=''
						/>
						<div className='event-tile-phone'>{contact_phone}</div>
					</div>
					<div className='event-tile-email-container'>
						<img
							src={mailIcon}
							alt=''
						/>
						<div className='event-tile-email'>{contact_email}</div>
					</div>
				</div>
				<div className='event-tile-description'>{description}</div>
			</div>
		</div>
	);
}
