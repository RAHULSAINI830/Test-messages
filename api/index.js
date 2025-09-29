const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/auth/register', require('./auth/register'));
app.use('/api/auth/login', require('./auth/login'));
app.use('/api/app/link', require('./app/link'));
app.use('/api/app/send', require('./app/send'));
app.use('/api/app/thread', require('./app/thread'));
app.use('/api/app/message', require('./app/message'));
app.use('/api/webhooks/telegram', require('./webhooks/telegram'));
app.use('/api/webhooks/discord', require('./webhooks/discord'));
app.use('/api/health', require('./health'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
