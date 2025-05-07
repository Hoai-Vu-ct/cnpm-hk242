const db = require('../utils/db');

// 1. Get all spaces
exports.getAllSpaces = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM StudySpace');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get space by ID
exports.getSpaceById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM StudySpace WHERE spaceId = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Space not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get space status only
exports.getSpaceStatus = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT spaceId, status FROM StudySpace WHERE spaceId = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Space not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Create new space
exports.createSpace = async (req, res) => {
    /*if (req.user?.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }*/

    try {
        const { location } = req.body;
        const [result] = await db.query('INSERT INTO StudySpace (location) VALUES (?)', [location]);
        const newSpaceId = result.insertId;

        // Fetch the newly created space
        const [rows] = await db.query('SELECT * FROM StudySpace WHERE spaceId = ?', [newSpaceId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Update space
exports.updateSpace = async (req, res) => {
    // Restrict to admin-only 
    if (req.user?.type !== 'Admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    try {
        const { location, status } = req.body;
        const [result] = await db.query(
            'UPDATE StudySpace SET location = COALESCE(?, location), status = COALESCE(?, status) WHERE spaceId = ?',
            [location, status, req.params.id]
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
};

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