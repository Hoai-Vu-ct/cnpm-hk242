-- Xóa database nếu đã tồn tại
DROP DATABASE IF EXISTS CNPM;
CREATE DATABASE IF NOT EXISTS CNPM;
CREATE USER 'user1'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON CNPM.* TO 'user1'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

USE CNPM

-- Creating tables
CREATE TABLE User (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    CCCD VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    type ENUM('Student', 'Admin', 'ITStaff') NOT NULL DEFAULT 'Student'
);

CREATE TABLE StudySpace (
    spaceId INT PRIMARY KEY AUTO_INCREMENT,
    location VARCHAR(100) NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    status ENUM('Available', 'Reserved', 'Occupied') NOT NULL DEFAULT 'Available'
) ;

CREATE TABLE Reservation (
    reservationId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    spaceId INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    checkedInTime DATETIME NULL,
    checkOutTime DATETIME NULL,
    status ENUM('Reserved', 'CheckedIn', 'Completed', 'Cancelled', 'AutoReleased') NOT NULL DEFAULT 'Reserved',
    reminded BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE,
    FOREIGN KEY (spaceId) REFERENCES StudySpace(spaceId) ON DELETE CASCADE
);

CREATE TABLE Sensor (
    sensorId INT PRIMARY KEY AUTO_INCREMENT,
    spaceId INT NOT NULL,
    status ENUM('On', 'Off') NOT NULL DEFAULT 'Off',
    lastMotionTime DATETIME,
    FOREIGN KEY (spaceId) REFERENCES StudySpace(spaceId) ON DELETE CASCADE
);

CREATE TABLE Equipment (
    equipmentId INT PRIMARY KEY AUTO_INCREMENT,
    spaceId INT NOT NULL,
    status ENUM('On', 'Off') NOT NULL DEFAULT 'Off',
    FOREIGN KEY (spaceId) REFERENCES StudySpace(spaceId) ON DELETE CASCADE
);

CREATE TABLE Notification (
    notificationId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read') DEFAULT 'unread',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
);

ALTER TABLE StudySpace 
ADD COLUMN startTime TIME NOT NULL,
ADD COLUMN endTime TIME NOT NULL;

ALTER TABLE reservation
ADD COLUMN checkedInTime DATETIME NULL,
ADD COLUMN checkOutTime DATETIME NULL;

ALTER TABLE studyspace
DROP COLUMN status;

ALTER TABLE User 
CHANGE name username VARCHAR(50) NOT NULL