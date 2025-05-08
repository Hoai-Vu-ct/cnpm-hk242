const db = require('../utils/db');

// Turn ON devices
async function turnOnDevices(spaceId) {
    const [equipments] = await db.query('SELECT * FROM Equipment WHERE spaceId = ?', [spaceId]);
    const [sensors] = await db.query('SELECT * FROM Sensor WHERE spaceId = ?', [spaceId]);

    for (const eq of equipments) {
        await db.query('UPDATE Equipment SET status = "ON" WHERE equipmentId = ?', [eq.equipmentId]);
    }

    for (const sensor of sensors) {
        await db.query('UPDATE Sensor SET status = "ON" WHERE sensorId = ?', [sensor.sensorId]);
    }

    console.log(`[IoT] Turned ON all devices in Space ${spaceId}`);
}

// Turn OFF devices
async function turnOffDevices(spaceId) {
    const [equipments] = await db.query('SELECT * FROM Equipment WHERE spaceId = ?', [spaceId]);
    const [sensors] = await db.query('SELECT * FROM Sensor WHERE spaceId = ?', [spaceId]);

    for (const eq of equipments) {
        await db.query('UPDATE Equipment SET status = "OFF" WHERE equipmentId = ?', [eq.equipmentId]);
    }

    for (const sensor of sensors) {
        await db.query('UPDATE Sensor SET status = "OFF" WHERE sensorId = ?', [sensor.sensorId]);
    }

    console.log(`[IoT] Turned OFF all devices in Space ${spaceId}`);
}

exports.turnOnDevices = turnOnDevices;
exports.turnOffDevices = turnOffDevices;

// // Helper to update status for both Equipment and Sensors
// function updateDeviceStatus(spaceId, newStatus, res, action) {
//     // Update Equipment first
//     const updateEquipmentQuery = `
//         UPDATE Equipment
//         SET status = ?
//         WHERE spaceId = ?
//     `;

//     db.query(updateEquipmentQuery, [newStatus, spaceId], (err1, result1) => {
//         if (err1) {
//             console.error(`[IoT] DB Error updating Equipment during ${action}:`, err1);
//             return res.status(500).json({ message: 'Database error (equipment)' });
//         }

//         // Then update Sensors
//         const updateSensorQuery = `
//             UPDATE Sensor
//             SET status = ?
//             WHERE spaceId = ?
//         `;

//         db.query(updateSensorQuery, [newStatus, spaceId], (err2, result2) => {
//             if (err2) {
//                 console.error(`[IoT] DB Error updating Sensors during ${action}:`, err2);
//                 return res.status(500).json({ message: 'Database error (sensors)' });
//             }

//             console.log(`[IoT] Turned ${newStatus} devices and sensors for Space ${spaceId}`);
//             res.json({ message: `Devices and sensors turned ${newStatus} for Space ${spaceId}` });
//         });
//     });
// }

// // Turn ON all devices and sensors in a space
// exports.turnOn = async (req, res) => {
//     const { spaceId } = req.body;

//     if (!spaceId) {
//         return res.status(400).json({ error: 'Missing spaceId' });
//     }

//     updateDeviceStatus(spaceId, 'ON', res, 'turnOn');
// };

// // Turn OFF all devices and sensors in a space
// exports.turnOff = async (req, res) => {
//     const { spaceId } = req.body;

//     if (!spaceId) {
//         return res.status(400).json({ error: 'Missing spaceId' });
//     }

//     updateDeviceStatus(spaceId, 'OFF', res, 'turnOff');
// };
