import React from 'react';
import { useLocation } from 'react-router-dom';

// Components
import CreateEvent from '../components/CreateEvent';

// Styles
import '../styles/admin.css';

export default function Admin() {
	const location = useLocation();
	const user = location.state;

	console.log(user);

	return (
		<div className='admin-page'>
			<h1>{user.username}</h1>
			<CreateEvent user={user} />
		</div>
	);
}
