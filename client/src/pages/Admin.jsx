import React from 'react';

import { useLocation } from 'react-router-dom';

export default function Admin() {
	const location = useLocation();
	const user = location.state;

	console.log(user);

	return <div>{user.username}</div>;
}
