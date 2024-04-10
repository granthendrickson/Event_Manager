import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';

export default function Event() {
	const location = useLocation();
	const userAndEvent = location.state;
	const [event, setEvent] = useState(null);
	const [comments, setComments] = useState([]);
	const [usernames, setUsernames] = useState({});
	const [newCommentText, setNewCommentText] = useState('');

	const fetchComments = async () => {
		try {
			const response = await fetch(
				`http://localhost:8080/Comments/${userAndEvent.event_id}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch comments');
			}
			const commentsData = await response.json();
			setComments(commentsData);
			// Fetch usernames for all comments
			const userIds = commentsData.map((comment) => comment.user_id);
			fetchUsernames(userIds);
		} catch (error) {
			console.error('Error fetching comments:', error);
		}
	};

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				const response = await fetch(
					`http://localhost:8080/Events/${userAndEvent.event_id}`
				);
				if (!response.ok) {
					throw new Error('Failed to fetch event');
				}
				const eventData = await response.json();
				setEvent(eventData);
			} catch (error) {
				console.error('Error fetching event:', error);
			}
		};

		if (userAndEvent.event_id) {
			fetchEvent();
			fetchComments();
		}
	}, [userAndEvent.event_id]);

	const handlePostComment = async () => {
		try {
			const response = await fetch('http://localhost:8080/Comments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					event_id: userAndEvent.event_id,
					user_id: userAndEvent.user.user_id, // Assuming user_id is available in userAndEvent
					comment_text: newCommentText,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to post comment');
			}

			// Optionally, you can reset the textarea after posting the comment
			setNewCommentText('');

			// Refetch comments after posting a new comment
			fetchComments();
		} catch (error) {
			console.error('Error posting comment:', error);
		}
	};

	const fetchUsernames = async (userIds) => {
		try {
			const promises = userIds.map((userId) =>
				fetch(`http://localhost:8080/Users/${userId}`)
			);
			const responses = await Promise.all(promises);
			const userData = await Promise.all(
				responses.map((res) => res.json())
			);
			const usernameMap = {};
			userData.forEach((user) => {
				usernameMap[user.user_id] = user.username;
			});
			setUsernames(usernameMap);
		} catch (error) {
			console.error('Error fetching usernames:', error);
		}
	};

	return (
		<div>
			{event ? (
				<div>
					<h2>{event.name}</h2>
					<p>Category: {event.category}</p>
					<p>Description: {event.description}</p>
					<p>Date: {moment(event.date).format('DD MMM, YYYY')}</p>
					<p>Time: {moment(event.time, 'HH:mm').format('LT')}</p>
					<p>Email: {event.contact_email}</p>
					<p>Phone: {event.contact_phone}</p>
					<div className='comments-container'>
						<div className='new-comment'>
							<textarea
								name='new-comment-text'
								cols='30'
								rows='10'
								value={newCommentText}
								onChange={(e) =>
									setNewCommentText(e.target.value)
								}
							></textarea>
							<button onClick={handlePostComment}>
								Post Comment
							</button>
						</div>
						<div className='comments-list'>
							<h3>Comments:</h3>
							<ul>
								{comments.map((comment) => (
									<div key={comment.comment_id}>
										<p>{comment.comment_text}</p>
										<p>
											{moment(comment.timestamp).format(
												'DD MMM, LT'
											)}
										</p>
										<p>
											User:{' '}
											{usernames[comment.user_id] ||
												'Unknown User'}
										</p>
									</div>
								))}
							</ul>
						</div>
					</div>
				</div>
			) : (
				<p>Loading event...</p>
			)}
		</div>
	);
}
