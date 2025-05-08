const db = require('../utils/db');

// Get all spaces
exports.getAllSpaces = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM StudySpace');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get space by ID
exports.getSpaceById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM StudySpace WHERE spaceId = ?', [req.params.spaceId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Space not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Create new space
exports.createSpace = async (req, res) => {
    /*if (req.user?.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }*/

    try {
        const { location, startTime, endTime } = req.body;

        if (!location || !startTime || !endTime) {
            return res.status(400).json({ error: 'Missing location, startTime, or endTime' });
        }

        const [result] = await db.query(
            'INSERT INTO StudySpace (location, startTime, endTime) VALUES (?, ?, ?)',
            [location, startTime, endTime]
        );

        const newSpaceId = result.insertId;

        // Fetch the newly created space
        const [rows] = await db.query('SELECT * FROM StudySpace WHERE spaceId = ?', [newSpaceId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update space
exports.updateSpace = async (req, res) => {
    // // Restrict to admin-only 
    // if (req.user?.type !== 'Admin') {
    //     return res.status(403).json({ error: 'Access denied. Admins only.' });
    // }

    try {
        const { location, startTime, endTime } = req.body;

        const [result] = await db.query(
            `UPDATE StudySpace 
             SET 
                location = COALESCE(?, location),
                startTime = COALESCE(?, startTime),
                endTime = COALESCE(?, endTime)
             WHERE spaceId = ?`,
            [location, status, startTime, endTime, req.params.id]
        );

        if (result.affectedRows > 0) {
            const [rows] = await db.query('SELECT * FROM StudySpace WHERE spaceId = ?', [req.params.id]);
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Space not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};8

// 6. Delete space
exports.deleteSpace = async (req, res) => {
    /*if (req.user?.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }*/
   
    try {
        const [result] = await db.query('DELETE FROM StudySpace WHERE spaceId = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Space deleted' });
        } else {
            res.status(404).json({ error: 'Space not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};