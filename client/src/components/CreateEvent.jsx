import React, { useEffect, useState } from 'react';
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

export default function CreateEvent(props) {
	const { user } = props;
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
	const [createdLocation, setCreatedLocation] = useState(null);
	const [rsoList, setRsoList] = useState([]);

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
			const eventWithLocationAndUniversity = {
				...event,
				location_id: createdLocation.location_id,
				university_id: user.university_id,
			};

			const response = await fetch('http://localhost:8080/Events', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(eventWithLocationAndUniversity),
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

	useEffect(() => {
		const fetchRsoList = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/RSOs/${user.user_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch RSOs');
				}
				const data = await response.json();
				setRsoList(data.rsoList);
			} catch (error) {
				console.error('Error fetching RSOs:', error);
			}
		};
		fetchRsoList();
	}, [user.user_id]);

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
					  (
							<div className='inputField'>
								<label>RSO ID:</label>
								<select
									name='rso_id'
									value={event.rso_id}
									onChange={handleInputChange}
								>
									<option value=''>Select RSO</option>
									{rsoList.map((rso) => (
										<option
											key={rso.rso_id}
											value={rso.rso_id}
										>
											{rso.name}
										</option>
									))}
								</select>
							</div>
					  ))
					: null}

				{event.visibility === 'private'
					? ((event.approval_status = 'approved'),
					  (event.rso_id = null))
					: null}
				{loadError ? (
					<div>Error loading maps</div>
				) : !isLoaded ? (
					<div>Loading maps</div>
				) : (
					<div>
						<Search
							panTo={panTo}
							setCreatedLocation={setCreatedLocation}
						/>
						<GoogleMap
							mapContainerStyle={mapContainerStyle}
							zoom={15}
							center={center}
							options={options}
							onLoad={onMapLoad}
						>
							<Marker position={center} />
						</GoogleMap>
						{createdLocation && (
							<div>Location: {createdLocation.name}</div>
						)}
					</div>
				)}
				<div className='buttonContainer'>
					<button onClick={handleCreateEvent}>Create Event</button>
				</div>
			</div>
		</div>
	);
}

function Search({ panTo, setCreatedLocation }) {
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

	const [location, setLocation] = useState({
		name: '',
		latitude: '',
		longitude: '',
	});

	const handleInput = (e) => {
		setValue(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Create location on server
			const response = await fetch('http://localhost:8080/Locations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(location),
			});

			if (!response.ok) {
				throw new Error('Failed to create location');
			}

			const newLocation = await response.json();
			console.log('New location created:', newLocation);
			setCreatedLocation(newLocation); // Update created location in CreateEvent component
		} catch (error) {
			console.error('Error creating location:', error);
		}
	};

	const handleSelect = async (address) => {
		setValue(address, false);
		clearSuggestions();

		try {
			const results = await getGeocode({ address });
			const { lat, lng } = await getLatLng(results[0]);
			panTo({ lat, lng });
			setLocation({ name: address, latitude: lat, longitude: lng });
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
							data.map(({ description }, index) => (
								<ComboboxOption
									key={index}
									value={description}
								/>
							))}
					</ComboboxList>
				</ComboboxPopover>
			</Combobox>
			<button onClick={handleSubmit}>Set Location</button>
		</div>
	);
}
