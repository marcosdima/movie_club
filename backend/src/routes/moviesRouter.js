const movieService = require('../services/moviesService');
const moviesRouter = require('express').Router();

//TODO: A middleware to check if the body has a movie...

moviesRouter.get('/', async (req, res) => {
  const movies = await movieService.getMovies();
  res.json(movies);
});

moviesRouter.post('/', async (req, res) => {
  const { movie } = req.body;
  if (!movie) return res.status(400).json({ error: "missing movie field" })

  const { user } = req;
  if (!user) return res.status(401).json({ error: 'token invalid' });

  const newMovie = await movieService.addMovie(movie);
  res.status(201).json(newMovie);
});

moviesRouter.post('/many', async (req, res) => {
  const { movies } = req.body;
  if (!movies) return res.status(400).json({ error: "missing movies field" })

  const { user } = req;
  if (!user) return res.status(401).json({ error: 'token invalid' });

  const newMovie = await movieService.addMovies(movies);
  res.json(newMovie);
});

module.exports = moviesRouter;