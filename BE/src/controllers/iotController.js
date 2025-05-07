const db = require('../utils/db');

// Helper to update status for both Equipment and Sensors
function updateDeviceStatus(spaceId, newStatus, res, action) {
    // Update Equipment first
    const updateEquipmentQuery = `
        UPDATE Equipment
        SET status = ?
        WHERE spaceId = ?
    `;

    db.query(updateEquipmentQuery, [newStatus, spaceId], (err1, result1) => {
        if (err1) {
            console.error(`[IoT] DB Error updating Equipment during ${action}:`, err1);
            return res.status(500).json({ message: 'Database error (equipment)' });
        }

        // Then update Sensors
        const updateSensorQuery = `
            UPDATE Sensor
            SET status = ?
            WHERE spaceId = ?
        `;

        db.query(updateSensorQuery, [newStatus, spaceId], (err2, result2) => {
            if (err2) {
                console.error(`[IoT] DB Error updating Sensors during ${action}:`, err2);
                return res.status(500).json({ message: 'Database error (sensors)' });
            }

            console.log(`[IoT] Turned ${newStatus} devices and sensors for Space ${spaceId}`);
            res.json({ message: `Devices and sensors turned ${newStatus} for Space ${spaceId}` });
        });
    });
}

// Turn ON all devices and sensors in a space
exports.turnOnDevices = (req, res) => {
    const { spaceId } = req.body;

    if (!spaceId) {
        return res.status(400).json({ error: 'Missing spaceId' });
    }

    updateDeviceStatus(spaceId, 'ON', res, 'turnOn');
};

// Turn OFF all devices and sensors in a space
exports.turnOffDevices = (req, res) => {
    const { spaceId } = req.body;

    if (!spaceId) {
        return res.status(400).json({ error: 'Missing spaceId' });
    }

    updateDeviceStatus(spaceId, 'OFF', res, 'turnOff');
};
