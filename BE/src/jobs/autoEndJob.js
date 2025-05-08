const cron = require('node-cron');
const db = require('../utils/db'); 
const { turnOffDevicesForSpace } = require('../controllers/iotController');

function autoEndJob() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log("[Auto-End Job] Running to end expired reservations...");

        const now = new Date()

        try {
            // Find active reservations whose endTime is passed
            const [reservations] = await db.query(
                `SELECT * FROM Reservation WHERE status = 'CheckedIn' AND endTime <= ?`,
                [now]
            );

            for (let resv of reservations) {
                console.log(`[Auto-End Job] Completing reservation ${resv.reservationId}`);

                // Mark reservation as completed
                await db.query(
                    `UPDATE Reservation SET status = 'Completed' WHERE reservationId = ?`,
                    [resv.reservationId]
                );

                // Turn off devices in that space
                await turnOffDevicesForSpace(resv.spaceId);
            }

            console.log(`[Auto-End Job] Completed processing ${reservations.length} reservations`);
        } catch (err) {
            console.error("[Auto-End Job] Error:", err);
        }
    });
}

module.exports = { autoEndJob };
