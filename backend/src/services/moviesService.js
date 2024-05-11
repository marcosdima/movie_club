const Movie = require('../models/movie');

const getMovies = async () => await Movie.find({});

const getMovie = async (id) => await Movie.findById(id);

const addMovie = async (data) => {
  const newMovie = new Movie(data);
  await newMovie.save();
  return newMovie;
};

const addMovies = async (data) => {
  const newMovies = await Movie.insertMany(data);
  return newMovies;
};

module.exports = {
  getMovies,
  getMovie,
  addMovie,
  addMovies
};