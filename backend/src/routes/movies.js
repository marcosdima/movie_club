const movieService = require('../services/movieService');
const moviesRouter = require('express').Router();

moviesRouter.get('/', async (req, res) => {
    const movies = await movieService.getMovies();
    res.json(movies);
});

moviesRouter.post('/', async (req, res) => {
    const newMovie = await movieService.addMovie(req.body);
    res.json(newMovie);
});

module.exports = moviesRouter;