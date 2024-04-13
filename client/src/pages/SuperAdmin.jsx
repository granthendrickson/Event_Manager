import React from 'react';
import { useLocation } from 'react-router-dom';

// Components
import CreateUniversity from '../components/CreateUniversity';
import University from '../components/University';

// Styles
import '../styles/superAdmin.css';

export default function SuperAdmin() {
	const location = useLocation();
	const user = location.state;

	console.log(user);

	return (
		<div className='super-admin-page'>
			<div className='super-admin-page-header'>
				<h1>Super Admin Dashboard</h1>
			</div>
			{user.university_id === null ? (
				<CreateUniversity user_id={user.user_id} />
			) : (
				<University university_id={user.university_id} />
			)}
		</div>
	);
}
