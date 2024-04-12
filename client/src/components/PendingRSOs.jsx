import React, { useState, useEffect } from 'react';

export default function PendingRSOs(props) {
	const { university_id } = props;

	const [pendingRSOs, setPendingRSOs] = useState(null);
	const [adminUsernames, setAdminUsernames] = useState({});

	// Function to fetch pending RSOs
	const fetchPendingRSOs = async () => {
		try {
			const response = await fetch(
				`http://localhost:8080/RSOs/pending/${university_id}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch pending RSOs');
			}
			const data = await response.json();
			setPendingRSOs(data);
		} catch (error) {
			console.error('Error fetching pending RSOs:', error);
		}
	};

	useEffect(() => {
		fetchPendingRSOs();
	}, [university_id]);

	useEffect(() => {
		const fetchAdminUsernames = async () => {
			if (pendingRSOs) {
				const admins = pendingRSOs.map((rso) => rso.admin_id);
				const uniqueAdmins = Array.from(new Set(admins));
				const adminUsernames = {};

				try {
					for (const adminId of uniqueAdmins) {
						const response = await fetch(
							`http://localhost:8080/Users/${adminId}`
						);
						if (!response.ok) {
							throw new Error('Failed to fetch admin username');
						}
						const user = await response.json();
						adminUsernames[adminId] = user.username;
					}
					setAdminUsernames(adminUsernames);
				} catch (error) {
					console.error('Error fetching admin username:', error);
				}
			}
		};

		fetchAdminUsernames();
	}, [pendingRSOs]);

	const getUsername = (adminId) => {
		return adminUsernames[adminId] || 'Unknown';
	};

	const approveRSO = async (rsoId) => {
		try {
			const response = await fetch(
				`http://localhost:8080/RSOs/approve/${rsoId}`,
				{
					method: 'POST',
				}
			);
			if (!response.ok) {
				throw new Error('Failed to approve RSO');
			}
			// Refresh pending RSOs after approval
			fetchPendingRSOs();
		} catch (error) {
			console.error('Error approving RSO:', error);
		}
	};

	return (
		<div>
			{pendingRSOs ? (
				<div>
					<h2>Pending RSOs</h2>
					<ul>
						{pendingRSOs.map((rso) => (
							<div
								className='rso-tile'
								key={rso.rso_id}
							>
								<div className='rso-tile-name-and-admin-container'>
									<div className='rso-tile-name'>
										{rso.name}
									</div>
									<div className='rso-tile-admin'>
										Admin: {getUsername(rso.admin_id)}
									</div>
								</div>
								<button
									id='approve-rso-button'
									onClick={() => approveRSO(rso.rso_id)}
								>
									Approve RSO
								</button>
							</div>
						))}
					</ul>
				</div>
			) : (
				<p>Loading pending RSOs...</p>
			)}
		</div>
	);
}
