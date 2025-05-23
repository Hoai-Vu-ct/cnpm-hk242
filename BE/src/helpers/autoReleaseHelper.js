const { turnOffDevices } = require('../controllers/iotController');
const db = require('../utils/db');

async function autoReleaseNoShows() {
    const releaseThresholdMinutes = 15;
    const now = new Date();

    // Get reservations that are "reserved" but not checked-in and past threshold
    const [rows] = await db.query(`
        SELECT * FROM Reservation 
        WHERE status = 'reserved' 
        AND TIMESTAMPDIFF(MINUTE, startTime, ?) > ?
    `, [now, releaseThresholdMinutes]);

    const releasedIds = [];

    for (let resv of rows) {
        // Cancel reservation
        await db.query(`UPDATE Reservation SET status = 'AutoReleased' WHERE reservationId = ?`, [resv.reservationId]);
        
        // Turn off devices
        turnOffDevices(resv.spaceId);

        releasedIds.push(resv.reservationId);
    }

    return releasedIds;
}

module.exports = { autoReleaseNoShows };
