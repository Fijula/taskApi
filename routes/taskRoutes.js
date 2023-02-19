const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();

router.post('/tasks', taskController.create);
router.patch('/tasks/:taskId', taskController.update);
router.delete('/tasks/:taskId', taskController.delete);
router.get('/tasks', taskController.getAll);
router.post('/tasks/sort', taskController.sort);

module.exports = router;