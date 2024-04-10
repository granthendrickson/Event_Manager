import React, { useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

import usePlacesAutocomplete, {
	getGeocode,
	getLatLng,
} from 'use-places-autocomplete';
import {
	Combobox,
	ComboboxInput,
	ComboboxPopover,
	ComboboxList,
	ComboboxOption,
} from '@reach/combobox';

import '@reach/combobox/styles.css';

const mapContainerStyle = {
	width: '100%',
	height: '500px',
};
const center = {
	lat: 28.602823018995718, // default latitude
	lng: -81.2001028153412, // default longitude
};

const options = {
	disableDefaultUI: true,
	zoomControl: true,
};

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
		university_id: '',
	});

	const [libraries] = useState(['places']);

	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: 'AIzaSyBH4Ka4wzj7gy4NmfRlANFQFO3gHMPmyYk',
		libraries,
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

	const mapRef = React.useRef();
	const onMapLoad = React.useCallback((map) => {
		mapRef.current = map;
	}, []);

	const panTo = React.useCallback(({ lat, lng }) => {
		mapRef.current.panTo({ lat, lng });
		mapRef.current.setZoom(14);
	}, []);

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
				{event.visibility === 'rso'
					? ((event.approval_status = 'approved'),
					  (event.university_id = null),
					  (
							<div className='inputField'>
								<label>RSO ID:</label>
								<input
									type='text'
									name='rso_id'
									value={event.rso_id}
									onChange={handleInputChange}
								/>
							</div>
					  ))
					: null}

				{event.visibility === 'private'
					? ((event.approval_status = 'approved'),
					  (event.rso_id = null),
					  (
							<div className='inputField'>
								<label>University ID:</label>
								<input
									type='text'
									name='university_id'
									value={event.university_id}
									onChange={handleInputChange}
								/>
							</div>
					  ))
					: null}
				{loadError ? (
					<div>Error loading maps</div>
				) : !isLoaded ? (
					<div>Loading maps</div>
				) : (
					<div>
						<Search panTo={panTo} />
						<GoogleMap
							mapContainerStyle={mapContainerStyle}
							zoom={15}
							center={center}
							options={options}
							onLoad={onMapLoad}
						>
							<Marker position={center} />
						</GoogleMap>
					</div>
				)}
				<div className='buttonContainer'>
					<button onClick={handleCreateEvent}>Create Event</button>
				</div>
			</div>
		</div>
	);
}

function Search({ panTo }) {
	const {
		ready,
		value,
		suggestions: { status, data },
		setValue,
		clearSuggestions,
	} = usePlacesAutocomplete({
		requestOptions: {
			location: { lat: () => 43.6532, lng: () => -79.3832 },
			radius: 100 * 1000,
		},
	});

	// https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

	const handleInput = (e) => {
		setValue(e.target.value);
	};

	const handleSelect = async (address) => {
		setValue(address, false);
		clearSuggestions();

		try {
			const results = await getGeocode({ address });
			const { lat, lng } = await getLatLng(results[0]);
			panTo({ lat, lng });
			console.log({ lat, lng });
		} catch (error) {
			console.log('😱 Error: ', error);
		}
	};

	return (
		<div className='search'>
			<Combobox onSelect={handleSelect}>
				<ComboboxInput
					value={value}
					onChange={handleInput}
					disabled={!ready}
					placeholder='Search your location'
				/>
				<ComboboxPopover>
					<ComboboxList>
						{status === 'OK' &&
							data.map(({ id, description }) => (
								<ComboboxOption
									key={id}
									value={description}
								/>
							))}
					</ComboboxList>
				</ComboboxPopover>
			</Combobox>
		</div>
	);
}
