const db = require('../models/db');

const addExercise = (req, res, next) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  // Validate required fields
  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  // Validate duration is a number
  const durationNum = parseInt(duration);
  if (isNaN(durationNum)) {
    return res.status(400).json({ error: 'Duration must be a number' });
  }

  // Use current date if not provided
  const exerciseDate = date ? new Date(date) : new Date();
  if (isNaN(exerciseDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [_id], (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stmt = db.prepare(
      'INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)'
    );
    stmt.run(
      _id,
      description,
      durationNum,
      exerciseDate.toISOString().split('T')[0],
      function(err) {
        if (err) return next(err);
        res.json({
          _id: user.id,
          username: user.username,
          description,
          duration: durationNum,
          date: exerciseDate.toISOString().split('T')[0]
        });
      }
    );
    stmt.finalize();
  });
};

const getLogs = (req, res, next) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [_id], (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let query = 'SELECT * FROM exercises WHERE user_id = ?';
    const params = [_id];

    // Add date filters if provided
    if (from || to) {
      query += ' AND date';
      if (from) {
        query += ' >= ?';
        params.push(from);
      }
      if (to) {
        query += ' <= ?';
        params.push(to);
      }
    }

    // Always sort by date ascending
    query += ' ORDER BY date ASC';

    // Add limit if provided
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum)) {
        return res.status(400).json({ error: 'Limit must be a number' });
      }
      query += ' LIMIT ?';
      params.push(limitNum);
    }

    db.all(query, params, (err, exercises) => {
      if (err) return next(err);
      res.json({
        _id: user.id,
        username: user.username,
        count: exercises.length,
        log: exercises
      });
    });
  });
};

module.exports = {
  addExercise,
  getLogs
};
