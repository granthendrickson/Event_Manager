import React from 'react';

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
	} = props;

	return (
		<div className='event_tile'>
			<div className='event-tile-name-and-details'>
				<h1 className='event-tile-name'>Event Name</h1>

				<h3>Details:</h3>
				<div>Category: Social</div>
				<div>Date: 4/9/24</div>
				<div>Time: 12:30 PM</div>
				<div>Location: 123 Street st.</div>
			</div>

			<div className='event-tile-description-and-contact-info'>
				<div className='event-tile-contact-info'>
					<h3>Contact:</h3>
					<div className='event-tile-email'>
						Email: event@email.com
					</div>
					<div className='event-tile-phone'>Phone: 123 456 7890</div>
				</div>

				<div className='event-tile-description'>
					This is the description for the event.
				</div>
			</div>
		</div>
	);
}
