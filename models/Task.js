const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
date: { type: Date, required: true },
task: { type: String, required: true },
status: { type: String, enum: ['Complete', 'Incomplete'], required: true },
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Task', taskSchema);