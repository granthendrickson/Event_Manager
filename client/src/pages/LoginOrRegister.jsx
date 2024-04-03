import React from 'react';

// Components
import Register from '../components/Register';
import Login from '../components/Login';

import '../styles/loginRegister.css';

export default function LoginOrRegister() {
	return (
		<div className='loginOrRegister'>
			<Register />
			<Login />
		</div>
	);
}
