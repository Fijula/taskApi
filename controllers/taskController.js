const Task = require("../models/Task");
const session = require("../session");
const taskController = {};
const mongoose = require("mongoose");

taskController.create = async (req, res, next) => {
  const { date, task, status, ...extraKeys } = req.body;

  try {
    // Check for extra or invalid keys in request body
    const validKeys = ["date", "task", "status"];
    const invalidKeys = Object.keys(extraKeys).filter((key) => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ message: `Extra or Invalid Keys Passed: ${invalidKeys}` });
    }

    // Check if the session is valid and the user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    session.checkSession (req, res, async() => {
    const newTask = await Task.create({
      date,
      task,
      status,
      user: req.session.userId,
    });

    res.json({
      success: true,
      message: "Task created",
      task: newTask,
    });
  })} catch (err) {
    next(err);
  }
};


taskController.update = async (req, res, next) => {
  const { taskId } = req.params;
  const { date, task, status, ...extraKeys } = req.body;

  try {
    // Check for extra or invalid keys in request body
    const validKeys = ["date", "task", "status"];
    const invalidKeys = Object.keys(extraKeys).filter((key) => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ message: `Extra or Invalid Keys Passed: ${invalidKeys}` });
    }
    session.checkSession (req, res, async() => {

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: req.session.userId },
      { date, task, status },
      { new: true }
    );

    if (!updatedTask) {
      console.log("Task not found");
    }

    res.json({
      success: true,
      message: "Task updated",
      task: updatedTask,
    });
  })} catch (err) {
    next(err);
  }
};


taskController.delete = async (req, res) => {
  const taskId = req.params.taskId;
  console.log("req.session.userId ", req.session.userId);
    const taskObjectId = mongoose.Types.ObjectId(taskId);
    // Find the task by ID and user ID
    const task = await Task.findOne({
      _id: taskObjectId,
      user: req.session.userId,
    });
    console.log("task id..", taskObjectId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
  
    try {
      // Check if the session is valid and the user is logged in
  session.checkSession(req, res, async () => {
      await task.remove();
  
      return res.json({
        success: true,
        message: "Task deleted",
        task: {
          _id: task._id,
          date: task.date,
          task: task.task,
          status: task.status,
          user: task.user,
        },
      });
    })} catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  };
  
taskController.getAll = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  

    try {
        // Check if the session is valid and the user is logged in
  session.checkSession(req, res, async () => {
      const tasks = await Task.find({ user: req.session.userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ date: -1 });
      res.json({
        success: true,
      tasks,
      });
    })} catch (err) {
      next(err);
    }
  
};

taskController.sort = async (req, res, next) => {
  const { taskIds, page = 1, pageSize = 10 } = req.body;
  try {
    // Check if  the user is logged in
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
           // Check if the session is valid and the user is logged in
  session.checkSession(req, res, async () => {

    const tasks = await Task.find({
      _id: { $in: taskIds },
      user: req.session.userId,
    })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    if (tasks.length !== taskIds.length) {
      console.log("Invalid task ID");
    }

    // Sort tasks based on order of IDs in request
    const sortedTasks = taskIds.map((id) =>
      tasks.find((task) => task.id === id)
    );

    res.json({
      success: true,
      tasks: sortedTasks,
    });
  })} catch (err) {
    next(err);
  }
};

module.exports = taskController;
