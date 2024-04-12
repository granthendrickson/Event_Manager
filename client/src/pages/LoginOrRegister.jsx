import React from 'react';

// Components
import Register from '../components/Register';
import Login from '../components/Login';

import '../styles/loginRegister.css';

export default function LoginOrRegister() {
	return (
		<div className='login-page'>
			<div className='student-page-header'>
				<h1>College Event Manager</h1>
			</div>
			<div className='loginOrRegister'>
				<Register />
				<Login />
			</div>
		</div>
	);
}
