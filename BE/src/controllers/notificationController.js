const db = require('../utils/db');

exports.listNotifications = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    const query = 'SELECT * FROM Notification WHERE userId = ? ORDER BY timestamp DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
};

exports.sendNotification = (req, res) => {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
        return res.status(400).json({ message: 'Missing data' });
    }

    const query = 'INSERT INTO Notification (userId, title, message) VALUES (?, ?, ?)';
    db.query(query, [userId, title, message], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.json({ message: 'Notification sent', notificationId: result.insertId });
    });
};

exports.markAsRead = (req, res) => {
    const { notificationId, userId } = req.body;

    if (!notificationId || !userId) {
        return res.status(400).json({ message: 'Missing data' });
    }

    const query = 'UPDATE Notification SET status = "read" WHERE notificationId = ? AND user_id = ?';
    db.query(query, [notificationId, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
    });
};
