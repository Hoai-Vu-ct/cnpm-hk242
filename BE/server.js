const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up cron-job to auto-release rooms not checked-in every 10 minutes
const cron = require('node-cron');
const { autoReleaseNoShows } = require('./src/controllers/checkinController');

// Routes
const reservationsRoutes = require('./src/routes/reservation.js');
const spacesRoutes = require('./src/routes/spaces.js');
const checkinRoutes = require('./src/routes/checkin.js');
//const notificationsRoutes = require('./src/routes/notifications');
//const reportsRoutes = require('./src/routes/reports');

// Mounting routes
app.use('/api/reservations', reservationsRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/check', checkinRoutes);
//app.use('/api/notifications', notificationsRoutes);
//app.use('/api/reports', reportsRoutes);

// Run auto-release every 10 minutes
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});