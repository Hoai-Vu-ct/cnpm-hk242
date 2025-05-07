const db = require('../utils/db');
const { autoReleaseNoShows } = require('../helpers/autoReleaseHelper');

// Check-in API
exports.checkIn = async (req, res) => {
    const { reservationId, studentId } = req.body;

    if (!reservationId || !studentId) {
        return res.status(400).json({ message: 'Missing reservationId or studentId' });
    }

    try {
        // Fetch reservation from DB
        const [rows] = await db.query(
            `SELECT * FROM Reservation WHERE reservationId = ? AND userId = ?`,
            [reservationId, studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = rows[0];
        const now = new Date();
        const startTime = new Date(reservation.startTime);
        const endTime = new Date(reservation.endTime);

        // Allow check-in only within window (+10 min early buffer)
        const earlyBuffer = 10 * 60 * 1000; // 10 minutes
        if (now < new Date(startTime.getTime() - earlyBuffer)) {
            return res.status(400).json({ message: 'Too early to check in' });
        }

        if (now > endTime) {
            return res.status(400).json({ message: 'Reservation time has already ended' });
        }

        // Update reservation status to "checked_in"
        await db.query(
            `UPDATE Reservation SET status = 'checked_in' WHERE reservationId = ?`,
            [reservationId]
        );

        // Mark study space as "Occupied"
        await db.query(
            `UPDATE StudySpace SET status = 'Occupied' WHERE spaceId = ?`,
            [reservation.spaceId]
        );

        res.json({ message: 'Checked in successfully', reservationId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check-out API
exports.checkOut = async (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({ message: 'Missing reservationId' });
    }

    try {
        // Check reservation status
        const [rows] = await db.query(
            `SELECT * FROM Reservation WHERE reservationId = ?`,
            [reservationId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const reservation = rows[0];

        if (reservation.status !== 'checked_in') {
            return res.status(400).json({ message: 'Reservation is not currently checked in' });
        }

        // Mark as checked out (update status back to "completed")
        await db.query(
            `UPDATE Reservation SET status = 'completed' WHERE reservationId = ?`,
            [reservationId]
        );

        // Free up the study space (set back to Available)
        await db.query(
            `UPDATE StudySpace SET status = 'Available' WHERE spaceId = ?`,
            [reservation.spaceId]
        );

        res.json({ message: 'Checked out successfully', reservationId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Auto-release no-shows (no one shows up after 15 minutes)
exports.autoReleaseNoShows = async (req, res) => {
    try {
        const released = await autoReleaseNoShows();
        res.json({ message: 'Auto-release complete', released });
    } catch (err) {
        console.error('Error during auto-release:', err);
        res.status(500).json({ message: 'Error during auto-release' });
    }
};