const db = require('../models/db');

const createUser = (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
  stmt.run(username, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return next(err);
    }
    res.json({
      _id: this.lastID,
      username
    });
  });
  stmt.finalize();
};

const getUsers = (req, res, next) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
};

module.exports = {
  createUser,
  getUsers
};
