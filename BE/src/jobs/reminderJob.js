const cron = require('node-cron');
const { sendSystemNotification } = require('../controllers/notificationHelper');
const { reservations } = require('../controllers/reservationController');

function startReminderJob() {
    // Run every minute
    cron.schedule('* * * * *', () => {
        console.log("[ReminderJob] Running check for upcoming reservations...");

        const now = new Date();

        reservations.forEach(reservation => {   // Replace this with a query when DB
            if (reservation.reminded || reservation.status !== 'reserved') {
                return; // Skip if already reminded or not active
            }

            const start = new Date(reservation.startTime);
            const diffMinutes = (start - now) / (1000 * 60);

            if (diffMinutes <= 30 && diffMinutes >= 29) {
                // Within 30 minutes (+/- 1 min window)
                console.log(`[ReminderJob] Sending reminder to ${reservation.studentId}`);

                sendSystemNotification(
                    reservation.studentId,
                    "Upcoming Reservation Reminder",
                    `Your reservation for Space ${reservation.spaceId} starts at ${reservation.startTime}. Please check in on time!`
                );

                // Mark as reminded
                reservation.reminded = true;
            }
        });
    });
}

module.exports = { startReminderJob };
