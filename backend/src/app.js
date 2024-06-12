require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Utils
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

// Routers
const moviesRouter = require('./routes/moviesRouter');
const usersRouter = require('./routes/usersRouter');
const groupRouter = require('./routes/groupRouter');
const loginRouter = require('./routes/loginRouter');
const activitiesRouter = require('./routes/activitiesRouter');
const invitationRouter = require('./routes/invitationRouter');
const commentsRouter = require('./routes/commentsRouter');

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(express.json());
app.use(middleware.tokenExtractor);
app.use(middleware.userExtractor);
app.use(middleware.groupExtractor);
app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/groups', groupRouter);
app.use('/api/login', loginRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/invitations', invitationRouter);
app.use('/api/comments', commentsRouter);
app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

module.exports = app;