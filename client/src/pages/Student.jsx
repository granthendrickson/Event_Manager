import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';

// Components
import EventTile from '../components/EventTile';
import CreateRSO from '../components/CreateRSO';

// Styles
import '../styles/student.css';

export default function Student() {
	const location = useLocation();
	const user = location.state;
	const [events, setEvents] = useState([]);
	const [rsoList, setRsoList] = useState([]);

	const navigate = useNavigate();
	const toRSOPage = (user, RSO) => {
		navigate('../pages/RSO.jsx', { state: { user, RSO } });
	};

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

	console.log(events);

	return (
		<div className='student-page'>
			<h1>{user.username}</h1>
			<h2>Events:</h2>
			<div className='events-container'>
				<ul>
					{events.map((event) => (
						// <li key={event.event_id}>{event.name}</li>
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
							user={user}
						/>
					))}
				</ul>
			</div>
			{user.user_level === 'admin' && (
				<div className='rso-container'>
					<h2>Your RSOs:</h2>
					<ul>
						{rsoList.map((rso) => (
							<div
								onClick={() => toRSOPage(user, rso)}
								key={rso.rso_id}
							>
								{rso.name}
							</div>
						))}
					</ul>
				</div>
			)}
			<CreateRSO></CreateRSO>
		</div>
	);
}
