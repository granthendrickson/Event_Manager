import React, { useState } from 'react';

export default function CreateEvent() {
	// Initialize state to store input values
	const [event, setEvent] = useState({
		name: '',
		category: '',
		description: '',
		time: '',
		date: '',
		location_id: '',
		contact_phone: '',
		contact_email: '',
		visibility: 'public', // Default value
		approval_status: 'pending', // Default value
		rso_id: '', // Default value
	});

	// Function to handle input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEvent({ ...event, [name]: value });
	};

	const handleCreateEvent = async () => {
		try {
			const response = await fetch('http://localhost:8080/Events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(event),
			});
			if (!response.ok) {
				throw new Error('Failed to create event');
			}
			const newEvent = await response.json();
			console.log('New event created:', newEvent);
		} catch (error) {
			console.error('Error creating event:', error);
		}
	};

	return (
		<div className='createEvent'>
			<div className='createEventForm'>
				<h1>Create Event</h1>
				<div className='inputField'>
					<label>Name:</label>
					<input
						type='text'
						name='name'
						value={event.name}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Category:</label>
					<input
						type='text'
						name='category'
						value={event.category}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Description:</label>
					<textarea
						name='description'
						value={event.description}
						onChange={handleInputChange}
					></textarea>
				</div>
				<div className='inputField'>
					<label>Time:</label>
					<input
						type='time' // Use type 'time' for time picker
						name='time'
						value={event.time}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Date:</label>
					<input
						type='date' // Use type 'date' for date picker
						name='date'
						value={event.date}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Location ID:</label>
					<input
						type='text'
						name='location_id'
						value={event.location_id}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Contact Phone:</label>
					<input
						type='text'
						name='contact_phone'
						value={event.contact_phone}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Contact Email:</label>
					<input
						type='text'
						name='contact_email'
						value={event.contact_email}
						onChange={handleInputChange}
					/>
				</div>
				<div className='inputField'>
					<label>Visibility:</label>
					<select
						name='visibility'
						value={event.visibility}
						onChange={handleInputChange}
					>
						<option value='public'>Public</option>
						<option value='private'>Private</option>
						<option value='rso'>RSO</option>
					</select>
				</div>
				<div className='inputField'>
					<label>Approval Status:</label>
					<select
						name='approval_status'
						value={event.approval_status}
						onChange={handleInputChange}
					>
						<option value='approved'>Approved</option>
						<option value='pending'>Pending</option>
					</select>
				</div>
				<div className='inputField'>
					<label>RSO ID:</label>
					<input
						type='text'
						name='rso_id'
						value={event.rso_id}
						onChange={handleInputChange}
					/>
				</div>
				<div className='buttonContainer'>
					<button onClick={handleCreateEvent}>Create Event</button>
				</div>
			</div>
		</div>
	);
}
