USE Event_Manager

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_level ENUM('super admin', 'admin', 'student') NOT NULL
);

INSERT INTO Users (username, password, email, user_level)
VALUES ('test_user', 'password', 'test@example.com', 'student');