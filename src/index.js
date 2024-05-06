const express = require('express');
const app = express();
const config = require('./utils/config');
const mongoose = require('mongoose');
const moviesRouter = require('./routes/movies');
const logger = require('./utils/logger');

mongoose.connect(config.MONGODB_URI)
	.then(() => {
		logger.info('connected to MongoDB');
	})
	.catch((error) => {
		logger.error('error connecting to MongoDB:', error.message);
	});

app.use(express.json());
app.use('/api/movies', moviesRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});