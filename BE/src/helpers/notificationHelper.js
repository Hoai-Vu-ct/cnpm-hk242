const db = require('../utils/db');

exports.sendSystemNotification = (userId, title, message) => {
    const query = 'INSERT INTO Notification (userId, title, message) VALUES (?, ?, ?)';
    db.query(query, [userId, title, message], (err, result) => {
        if (err) {
            console.error('[System Notification Error]', err);
        } else {
            console.log(`[System Notification] Sent to user ${userId} (Notification ID: ${result.insertId})`);
        }
    });
};
