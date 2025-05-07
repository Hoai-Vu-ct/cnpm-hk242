const cron = require('node-cron');
const { autoReleaseNoShows } = require('../helpers/autoReleaseHelper');

// Run auto-release every 10 minutes
function autoReleaseRooms() {
    cron.schedule('*/10 * * * *', async () => {
        console.log('[Auto-release Job] Running auto-release task...');
        try {
            const released = await autoReleaseNoShows();
            console.log('[Auto-release Job] Released reservations:', released);
        } catch (err) {
            console.error('[Auto-release Job] Error:', err);
        }
    });
}

module.exports = { autoReleaseRooms };