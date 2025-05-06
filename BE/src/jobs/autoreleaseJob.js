// Set up cron-job to auto-release rooms not checked-in every 10 minutes
const cron = require('node-cron');
const { autoReleaseNoShows } = require('../controllers/checkinController');

// Run auto-release every 10 minutes
function autoReleaseRooms() {
    cron.schedule('*/10 * * * *', () => {
        console.log('[Cron Job] Running auto-release task...');
        // Call the controller logic directly
        autoReleaseNoShows(
            { body: {} }, // mock request
            { 
                json: (result) => {
                    console.log('[Cron Job] Auto-release result:', result);
                },
                status: (code) => ({
                    json: (result) => {
                        console.log(`[Cron Job] Auto-release error (${code}):`, result);
                    }
                })
            }
        );
    });
}

module.exports = { autoReleaseRooms };