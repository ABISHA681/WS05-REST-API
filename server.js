
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const pagesRouter = require('./routes/pages');
const postsRouter = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

// Connect to MongoDB
async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is missing from .env');
    throw new Error('MongoDB connection string is missing');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'blog',
      serverSelectionTimeoutMS: 10000
    });

    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

// Middleware
app.locals.publicDir = publicDir;
app.use(express.json());
app.use(express.static(publicDir));

// Website routes
app.use('/', pagesRouter);

// Blog REST API routes
app.use('/api/posts', postsRouter);

// 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, '404.html'));
});

// Error handling
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).sendFile(path.join(publicDir, '500.html'));
});

// Start server after MongoDB connects
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Mounted routers:');
      console.log('  / -> routes/pages.js');
      console.log('  /api/posts -> routes/posts.js');
    });
  })
  .catch((error) => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  });
