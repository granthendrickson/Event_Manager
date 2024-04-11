import React from 'react';
import { useLocation } from 'react-router-dom';

export default function RSO() {
	const location = useLocation();
	const userAndRSO = location.state;

	console.log(userAndRSO);

	return <div>RSO</div>;
}
