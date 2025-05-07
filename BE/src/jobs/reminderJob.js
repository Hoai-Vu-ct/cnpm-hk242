const cron = require('node-cron');
const db = require('../utils/db');
const { sendSystemNotification } = require('../helpers/notificationHelper');

function startReminderJob() {
    // Run every minute
    cron.schedule('* * * * *', () => {
        console.log("[Reminder Job] Running check for upcoming reservations...");

        const now = new Date();
        const query = `
            SELECT * FROM Reservation
            WHERE status = 'reserved' AND reminded = FALSE
        `;

        db.query(query, (err, reservations) => {
            if (err) {
                console.error('[Reminder Job] DB Error:', err);
                return;
            }

            reservations.forEach(reservation => {
                const start = new Date(reservation.startTime);
                const diffMinutes = (start - now) / (1000 * 60);

                if (diffMinutes <= 30 && diffMinutes >= 29) { // within 29-30 min window
                    console.log(`[Reminder Job] Sending reminder to user ${reservation.userId}`);

                    // Send notification
                    sendSystemNotification(
                        reservation.userId,
                        "Upcoming Reservation Reminder",
                        `Your reservation for Space ${reservation.spaceId} starts at ${reservation.startTime}. Please check in on time!`
                    );

                    // Mark as reminded in DB
                    const updateQuery = 'UPDATE Reservation SET reminded = TRUE WHERE reservationId = ?';
                    db.query(updateQuery, [reservation.reservationId], (err2) => {
                        if (err2) {
                            console.error('[Reminder Job] Failed to update reminded status:', err2);
                        }
                    });
                }
            });
        });
    });
}

module.exports = { startReminderJob };
