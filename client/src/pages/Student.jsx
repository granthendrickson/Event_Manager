import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';

// Components
import EventTile from '../components/EventTile';
import CreateRSO from '../components/CreateRSO';

// Styles
import '../styles/student.css';
import CreateEvent from '../components/CreateEvent';

export default function Student() {
	const location = useLocation();
	const user = location.state;
	const [events, setEvents] = useState([]);
	const [rsoList, setRsoList] = useState([]);
	const [showCreateEventForm, setShowCreateEventForm] = useState(false);
	const [showCreateRSOForm, setShowCreateRSOForm] = useState(false);
	const [showRSOs, setShowRSOs] = useState(true);

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

	const toggleCreateEventForm = () => {
		setShowCreateEventForm(true);
		setShowCreateRSOForm(false);
		setShowRSOs(false);
	};
	const toggleCreateRSOForm = () => {
		setShowCreateRSOForm(true);
		setShowCreateEventForm(false);
		setShowRSOs(false);
	};

	const toggleRSOs = () => {
		setShowRSOs(true);
		setShowCreateEventForm(false);
		setShowCreateRSOForm(false);
	};

	return (
		<div className='student-page'>
			<div className='student-page-header'>
				<h1>Your Dashboard:</h1>
				<div className='student-page-header-button-container'>
					<button
						id='rso-button'
						className='student-page-header-button'
						onClick={toggleRSOs}
					>
						RSOs
					</button>
					{user.user_level === 'admin' && (
						<button
							className='student-page-header-button'
							onClick={toggleCreateEventForm}
						>
							Create Event
						</button>
					)}
					<button
						className='student-page-header-button'
						onClick={toggleCreateRSOForm}
					>
						Request to Create RSO
					</button>
				</div>
			</div>

			<div className='student-page-body'>
				<div className='events-container'>
					<h2>Events available to you:</h2>
					<div className='events-list'>
						<ul>
							{events.map((event) => (
								// <li key={event.event_id}>{event.name}</li>
								<EventTile
									key={event.event_id}
									event_id={event.event_id}
									name={event.name}
									category={event.category}
									date={moment(event.date).format(
										'DD MMM, YYYY'
									)}
									time={moment(event.time, 'HH:mm').format(
										'LT'
									)}
									contact_email={event.contact_email}
									contact_phone={event.contact_phone}
									description={event.description}
									user={user}
								/>
							))}
						</ul>
					</div>
				</div>
				{showRSOs && (
					<div className='rso-container'>
						<h2 id='rso-header'>Your RSOs:</h2>
						<ul>
							{rsoList.map((rso) => (
								<div
									className='rso-tile'
									onClick={() => toRSOPage(user, rso)}
									key={rso.rso_id}
								>
									<h1 className='rso-tile-name'>
										{rso.name}
									</h1>
									{user.user_id === rso.admin_id ? (
										<div className='rso-membership-status'>
											Admin
										</div>
									) : (
										<div className='rso-membership-status'>
											Member
										</div>
									)}
								</div>
							))}
						</ul>
					</div>
				)}
				<div>{showCreateRSOForm && <CreateRSO />}</div>
				<div>{showCreateEventForm && <CreateEvent user={user} />}</div>
			</div>
		</div>
	);
}
