const movieService = require('../services/movieService');
const moviesRouter = require('express').Router();

moviesRouter.get('/', async (req, res) => {
    const movies = await movieService.getMovies();
    res.json(movies);
});

moviesRouter.post('/', (req, res) => {
    // TODO
});

module.exports = moviesRouter;