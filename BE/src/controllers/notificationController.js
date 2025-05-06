// In-memory fake notification store
const notifications = [];

exports.listNotifications = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    const userNotifications = notifications.filter(n => n.userId === userId);
    res.json(userNotifications);
};

exports.sendNotification = (req, res) => {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
        return res.status(400).json({ message: 'Missing data' });
    }

    const notificationId = `notif_${Date.now()}`;

    const newNotification = {
        notificationId,
        userId,
        title,
        message,
        status: 'unread',
        timestamp: new Date().toISOString(),
    };

    notifications.push(newNotification);

    res.json({ message: 'Notification sent', notificationId });
};

exports.markAsRead = (req, res) => {
    const { notificationId, userId } = req.body;

    if (!notificationId || !userId) {
        return res.status(400).json({ message: 'Missing data' });
    }

    const notification = notifications.find(n => n.notificationId === notificationId && n.userId === userId);

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    notification.status = 'read';

    res.json({ message: 'Notification marked as read' });
};
