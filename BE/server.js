const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Thay bằng URL của FE
  credentials: true, // Cho phép gửi cookie
}));
app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Đặt thành true nếu dùng HTTPS
    maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (1 ngày)
  },
}));

// Automatic cron jobs
const { startReminderJob } = require('./src/jobs/reminderJob.js');
const { autoReleaseRooms } = require('./src/jobs/autoreleaseJob.js');
const { autoEndJob } = require('./src/jobs/autoEndJob.js')

// Routes
const authRoutes = require('./src/routes/AuthRouter.js')
const userRoutes = require('./src/routes/UserRouter.js')
const reservationsRoutes = require('./src/routes/reservation.js');
const spacesRoutes = require('./src/routes/spaces.js');
const checkinRoutes = require('./src/routes/checkin.js');
const notificationsRoutes = require('./src/routes/notification.js');

// Mounting routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes); 
app.use('/api/reservations', reservationsRoutes);
app.use('/api/spaces', spacesRoutes);
app.use('/api/', checkinRoutes);
app.use('/api/notifications', notificationsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startReminderJob();     // Function that automatically send a notification 30 minutes before reservation starts
    autoReleaseRooms();     // Function that automatically releases reserved room that are empty for 10 minutes
    autoEndJob();           // Functio nthat automatically ends reservations that are past ending time (in case students forgot)
});