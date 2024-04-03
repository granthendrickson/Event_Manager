import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Student() {
	const location = useLocation();
	const user = location.state;

	return (
		<div className='student-page'>
			<h1>{user.username}</h1>
		</div>
	);
}
