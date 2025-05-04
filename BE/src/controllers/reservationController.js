// Simulated in-memory reservations (DB here later)
const reservations = [];

exports.createReservation = (req, res) => {
    const { studentId, spaceId, startTime, endTime } = req.body;

    if (!studentId || !spaceId || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing reservation data' });
    }

    // Validation: Prevent double booking (same space & overlapping time)
    const overlapping = reservations.find(r =>
        r.spaceId === spaceId &&
        r.status === 'reserved' &&
        (
            (new Date(startTime) < new Date(r.endTime)) &&
            (new Date(endTime) > new Date(r.startTime))
        )
    );

    if (overlapping) {
        return res.status(409).json({ message: 'This space is already booked at that time' });
    }

    const reservationId = `resv_${Date.now()}`;

    const newReservation = {
        reservationId,
        studentId,
        spaceId,
        startTime,
        endTime,
        status: 'reserved',
    };

    reservations.push(newReservation);

    res.json({ message: 'Reservation created', reservationId });
};

exports.cancelReservation = (req, res) => {
    const { reservationId, studentId } = req.body;

    if (!reservationId || !studentId) {
        return res.status(400).json({ message: 'Missing reservationId or studentId' });
    }

    const reservation = reservations.find(r => r.reservationId === reservationId && r.studentId === studentId);

    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
        return res.status(400).json({ message: 'Reservation already cancelled' });
    }

    reservation.status = 'cancelled';

    res.json({ message: 'Reservation cancelled', reservationId });
};

exports.getReservationsByStudent = (req, res) => {
    const { studentId } = req.params;

    const studentReservations = reservations.filter(r => r.studentId === studentId);

    res.json(studentReservations);
};

// Admin API: Get all reservations
exports.getAllReservations = (req, res) => {
    res.json(reservations);
};