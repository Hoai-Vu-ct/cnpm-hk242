// Simulated in-memory storage (Database later)
let checkedInReservations = {};

exports.checkIn = (req, res) => {
    const { reservationId, studentId } = req.body;

    if (!reservationId || !studentId) {
        return res.status(400).json({ message: 'Missing reservationId or studentId' });
    }

    // Simulate fetching reservation (replace with DB call later)
    const now = new Date();
    const reservationStart = new Date(now.getTime() - 10 * 60 * 1000); // 10 min ago
    const reservationEnd = new Date(now.getTime() + 50 * 60 * 1000); // 50 min later

    // Allow check-in only within reservation window (+10 min early buffer)
    const earlyBuffer = 10 * 60 * 1000; // 10 minutes
    if (now < new Date(reservationStart.getTime() - earlyBuffer)) {
        return res.status(400).json({ message: 'Too early to check in' });
    }

    if (now > reservationEnd) {
        return res.status(400).json({ message: 'Reservation time has already ended' });
    }

    // Mark this reservation as checked in
    checkedInReservations[reservationId] = {
        studentId,
        checkInTime: now,
    };

    res.json({ message: 'Checked in successfully', reservationId });
};

exports.checkOut = (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({ message: 'Missing reservationId' });
    }

    // Check if already checked in
    if (!checkedInReservations[reservationId]) {
        return res.status(400).json({ message: 'Reservation is not currently checked in' });
    }

    // Remove check-in record (simulate check-out)
    delete checkedInReservations[reservationId];

    res.json({ message: 'Checked out successfully', reservationId });
};

exports.autoReleaseNoShows = (req, res) => {
    // Simulated list of reservations (remove this and add DB later)
    const reservations = [
        {
            reservationId: 'resv123',
            studentId: 'stu456',
            startTime: new Date(new Date().getTime() - 30 * 60 * 1000), // started 30 mins ago
            checkedIn: false,
        },
        {
            reservationId: 'resv789',
            studentId: 'stu999',
            startTime: new Date(new Date().getTime() - 5 * 60 * 1000), // started 5 mins ago
            checkedIn: false,
        },
    ];

    // Release those not checked in within 15 mins
    const releaseThreshold = 15 * 60 * 1000; // 15 minutes
    const now = new Date();

    const released = [];

    reservations.forEach((resv) => {
        const timeSinceStart = now - resv.startTime;
        const alreadyCheckedIn = checkedInReservations[resv.reservationId];

        if (timeSinceStart > releaseThreshold && !alreadyCheckedIn) {
            // Auto-release logic (in real app: update DB to cancel reservation)
            released.push(resv.reservationId);
        }
    });

    res.json({ message: 'Auto-release complete', released });
};
