import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';

// Styles
import '../styles/student.css';

// Icons
import locationPing from '../img/locationPing.png';
import phoneIcon from '../img/phoneIcon.png';
import mailIcon from '../img/mailIcon.png';

export default function Event() {
	const location = useLocation();
	const userAndEvent = location.state;
	const [event, setEvent] = useState(null);
	const [comments, setComments] = useState([]);
	const [usernames, setUsernames] = useState({});
	const [newCommentText, setNewCommentText] = useState('');
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editCommentText, setEditCommentText] = useState('');

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

	const handleEditComment = (commentId, commentText) => {
		setEditingCommentId(commentId);
		setEditCommentText(commentText);
	};

	const handleCancelEditComment = () => {
		setEditingCommentId(null);
		setEditCommentText('');
	};

	const handleSaveEdit = async (commentId, updatedCommentText) => {
		try {
			const response = await fetch(
				`http://localhost:8080/Comments/${commentId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						comment_text: updatedCommentText,
					}),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to update comment');
			}

			// Update the comments state with the updated comment text
			const updatedComments = comments.map((comment) =>
				comment.comment_id === commentId
					? { ...comment, comment_text: updatedCommentText }
					: comment
			);
			setComments(updatedComments);

			// Reset the editingCommentId state
			setEditingCommentId(null);
		} catch (error) {
			console.error('Error updating comment:', error);
		}
	};

	return (
		<div className='event-page'>
			{event ? (
				<div className='event-container'>
					<div className='event-tile-name-and-category'>
						<h1 className='event-tile-name'>{event.name}</h1>
						<div className='event-tile-category'>
							{event.category}
						</div>
					</div>

					<div className='event-tile-date-and-time'>
						{moment(event.date).format('DD MMM, YYYY')} at{' '}
						{moment(event.time, 'HH:mm').format('LT')}
					</div>
					<div className='event-tile-location-container'>
						<img
							src={locationPing}
							alt=''
						/>
						<div className='event-tile-location'>
							Location: 123 Street st.
						</div>
					</div>
					<div className='event-tile-description-and-contact-info'>
						<div className='event-tile-contact-info'>
							<div className='event-tile-phone-container'>
								<img
									src={phoneIcon}
									alt=''
								/>
								<div className='event-tile-phone'>
									{event.contact_phone}
								</div>
							</div>
							<div className='event-tile-email-container'>
								<img
									src={mailIcon}
									alt=''
								/>
								<div className='event-tile-email'>
									{event.contact_email}
								</div>
							</div>
						</div>
						<div className='event-tile-description'>
							{event.description}
						</div>
					</div>
					<div className='comments-container'>
						<h1>Comments:</h1>
						<div className='new-comment'>
							<textarea
								className='new-comment-text'
								name='new-comment-text'
								cols='30'
								rows='10'
								value={newCommentText}
								onChange={(e) =>
									setNewCommentText(e.target.value)
								}
							></textarea>
							<button
								id='post-comment-button'
								onClick={handlePostComment}
							>
								Post Comment
							</button>
						</div>
						<div className='comments-list'>
							<ul>
								{comments.map((comment) => (
									<div key={comment.comment_id}>
										{/* Render comment text or editable textarea */}
										{editingCommentId ===
										comment.comment_id ? (
											<div className='edit-comment'>
												<textarea
													className='edit-comment-text'
													name='edit-comment-text'
													cols='30'
													rows='10'
													value={editCommentText}
													onChange={(e) =>
														setEditCommentText(
															e.target.value
														)
													}
												/>
												<button
													id='cancel-edit-button'
													onClick={
														handleCancelEditComment
													}
												>
													Cancel
												</button>
												<button
													id='save-edit-button'
													onClick={() =>
														handleSaveEdit(
															comment.comment_id,
															editCommentText
														)
													}
												>
													Save
												</button>
											</div>
										) : (
											<div className='comment'>
												<div className='comment-info'>
													<div className='comment-username-and-timestamp'>
														{' '}
														{usernames[
															comment.user_id
														] ||
															'Unknown User'}{' '}
														-{' '}
														{moment(
															comment.timestamp
														).format('DD MMM, LT')}
													</div>

													<div className='comment-text'>
														{comment.comment_text}
													</div>
												</div>

												{comment.user_id ===
													userAndEvent.user
														.user_id && (
													<button
														id='edit-comment-button'
														onClick={() =>
															handleEditComment(
																comment.comment_id,
																comment.comment_text
															)
														}
													>
														Edit
													</button>
												)}
											</div>
										)}
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
