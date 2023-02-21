const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
require('dotenv').config();

const app = express();
const DB = process.env.MONGO_URL;

// Connect to database
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
//   useCreateIndex: true
}).then(() => {
  console.log('Connected to database');
}).catch(err => {
  console.error('Error connecting to database:', err);
});

// Middleware
app.use(express.json());
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({                     //store the session data
    mongoUrl: DB,
    ttl: 24 * 60 * 60 // session TTL (1 day)
  })
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api', taskRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
