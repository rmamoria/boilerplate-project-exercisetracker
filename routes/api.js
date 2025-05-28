const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const exerciseController = require('../controllers/exerciseController');

router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);
router.post('/users/:_id/exercises', exerciseController.addExercise);
router.get('/users/:_id/logs', exerciseController.getLogs);

module.exports = router;
