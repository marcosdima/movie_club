const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Utils
const config = require('./utils/config');
const logger = require('./utils/logger');

// Routers
const moviesRouter = require('./routes/movies');
const usersRouter = require('./routes/users');
const groupRouter = require('./routes/groups');

mongoose.connect(config.MONGODB_URI)
	.then(() => {
		logger.info('connected to MongoDB');
	})
	.catch((error) => {
		logger.error('error connecting to MongoDB:', error.message);
	});

app.use(express.json());
app.use('/api/movies', moviesRouter);
app.use('/api/users', usersRouter);
app.use('/api/groups', groupRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});