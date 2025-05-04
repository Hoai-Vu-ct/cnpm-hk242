// Dummy in-memory data (for now)
let spaces = [
    { id: '1', name: 'Room A', location: 'Building 1', status: 'available' },
    { id: '2', name: 'Room B', location: 'Building 2', status: 'occupied' },
];

exports.getAllSpaces = (req, res) => {
    res.json(spaces);
};

exports.getSpaceById = (req, res) => {
    const space = spaces.find(s => s.id === req.params.id);
    if (space) {
        res.json(space);
    } else {
        res.status(404).json({ error: 'Space not found' });
    }
};

exports.getSpaceStatus = (req, res) => {
    const space = spaces.find(s => s.id === req.params.id);
    if (space) {
        res.json({ id: space.id, status: space.status });
    } else {
        res.status(404).json({ error: 'Space not found' });
    }
};

exports.createSpace = (req, res) => {
    const newSpace = {
        id: (spaces.length + 1).toString(),
        name: req.body.name,
        location: req.body.location,
        status: 'available',
    };
    spaces.push(newSpace);
    res.status(201).json(newSpace);
};

exports.updateSpace = (req, res) => {
    const space = spaces.find(s => s.id === req.params.id);
    if (space) {
        space.name = req.body.name || space.name;
        space.location = req.body.location || space.location;
        res.json(space);
    } else {
        res.status(404).json({ error: 'Space not found' });
    }
};

exports.deleteSpace = (req, res) => {
    const index = spaces.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
        spaces.splice(index, 1);
        res.json({ message: 'Space deleted' });
    } else {
        res.status(404).json({ error: 'Space not found' });
    }
};