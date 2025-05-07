USE CNPM

-- User
INSERT INTO User (name, email, password, type)
VALUES 
('Alice Nguyen', 'alice@student.hcmut.edu.vn', 'hashedpassword1', 'Student'),
('Bob Tran', 'bob@student.hcmut.edu.vn', 'hashedpassword2', 'Student'),
('Admin Pham', 'admin@hcmut.edu.vn', 'hashedpassword3', 'Admin');


-- StudySpace
INSERT INTO StudySpace (location, status)
VALUES 
('Building A - Room 101', 'Available'),
('Building B - Room 202', 'Available');


-- Reservation
INSERT INTO Reservation (userId, spaceId, startTime, endTime, status)
VALUES 
(1, 1, '2025-05-07 14:00:00', '2025-05-07 16:00:00', 'Reserved');


-- Sensor
INSERT INTO Sensor (spaceId, status, lastMotionTime)
VALUES 
(1, 'Off', NULL),
(2, 'Off', NULL);


-- Equipment
INSERT INTO Equipment (spaceId, status)
VALUES 
(1, 'Off'),
(1, 'Off'),
(2, 'Off');
