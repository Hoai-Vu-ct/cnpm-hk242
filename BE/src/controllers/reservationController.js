const db = require('../utils/db');
const { sendSystemNotification } = require('../helpers/notificationHelper');

// Create reservation
exports.createReservation = async (req, res) => {
    const { studentId, spaceId, startTime, endTime } = req.body;

    if (!studentId || !spaceId || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing reservation data' });
    }

    try {
        // Prevent double booking (check overlap)
        const [overlapping] = await db.query(
            `SELECT * FROM Reservation 
             WHERE spaceId = ? AND status = 'reserved' 
             AND (startTime < ? AND endTime > ?)`,
            [spaceId, endTime, startTime]
        );

        if (overlapping.length > 0) {
            return res.status(409).json({ message: 'This space is already booked at that time' });
        }

        // Insert reservation
        const [result] = await db.query(
            `INSERT INTO Reservation (userId, spaceId, startTime, endTime, status, reminded) 
             VALUES (?, ?, ?, ?, 'reserved', FALSE)`,
            [studentId, spaceId, startTime, endTime]
        );

        const reservationId = result.insertId;

        // Mark study space as "Reserved"
        await db.query(
            `UPDATE StudySpace SET status = 'Reserved' WHERE spaceId = ?`,
            [reservation.spaceId]
        );

        // Auto-send confirmation notification
        sendSystemNotification(
            studentId,
            "Reservation Confirmed",
            `Your reservation for Space ${spaceId} is confirmed from ${startTime} to ${endTime}.`
        );

        res.json({ message: 'Reservation created', reservationId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
    const { reservationId, studentId } = req.body;

    if (!reservationId || !studentId) {
        return res.status(400).json({ message: 'Missing reservationId or studentId' });
    }

    try {
        // Find reservation
        const [rows] = await db.query(
            `SELECT * FROM Reservation WHERE reservationId = ? AND userId = ?`,
            [reservationId, studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = rows[0];

        if (reservation.status === 'cancelled') {
            return res.status(400).json({ message: 'Reservation already cancelled' });
        }

        // Update status
        await db.query(
            `UPDATE Reservation SET status = 'cancelled' WHERE reservationId = ?`,
            [reservationId]
        );

        // Mark study space as "Available"
        await db.query(
            `UPDATE StudySpace SET status = 'Available' WHERE spaceId = ?`,
            [reservation.spaceId]
        );

        res.json({ message: 'Reservation cancelled', reservationId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get reservations by student
exports.getReservationsByStudent = async (req, res) => {
    const { studentId } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT * FROM Reservation WHERE userId = ?`,
            [studentId]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin: Get all reservations
exports.getAllReservations = async (req, res) => {
    /*if (req.user?.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }*/

    try {
        const [rows] = await db.query(`SELECT * FROM Reservation`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};