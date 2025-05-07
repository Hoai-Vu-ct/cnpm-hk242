const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Automatic cron jobs
const { startReminderJob } = require('./src/jobs/reminderJob.js');
const { autoReleaseRooms } = require('./src/jobs/autoreleaseJob.js');

// Routes
const reservationsRoutes = require('./src/routes/reservation.js');
const spacesRoutes = require('./src/routes/spaces.js');
const checkinRoutes = require('./src/routes/checkin.js');
const notificationsRoutes = require('./src/routes/notification.js');
const iotRoutes = require('./src/routes/iot.js');

// Mounting routes
app.use('/api/reservations', reservationsRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/', checkinRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/iot', iotRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startReminderJob();     // Function that automatically send a notification 30 minutes before reservation starts
    autoReleaseRooms();     // Function that automatically releases reserved room that are empty for 10 minutes
});