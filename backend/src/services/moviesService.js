const Movie = require('../models/movie');

const getMovies = async () => await Movie.find({});

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
  addMovie,
  addMovies
};