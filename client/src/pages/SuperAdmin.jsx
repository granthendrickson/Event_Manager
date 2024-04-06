import React from 'react';
import { useLocation } from 'react-router-dom';

// Components
import CreateUnivsersity from '../components/CreateUnivsersity';

// Styles
import '../styles/superAdmin.css';

export default function SuperAdmin() {
	const location = useLocation();
	const user = location.state;

	console.log(user);

	return (
		<div>
			<h1>Super Admin Dashboard</h1>
			<CreateUnivsersity />
		</div>
	);
}
