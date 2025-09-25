// lib/db.js
const mongoose = require('mongoose');
let isConnected = false;

async function connect() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  isConnected = true;
  console.log('✅ Mongo connected (cached)');
}
module.exports = { connect };
