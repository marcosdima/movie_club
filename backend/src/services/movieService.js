const movie = require('../models/movie');

const getMovies = async () => await movie.find({});

const addMovie = async (data) => {
    const newMovie = new movie(data);
    await newMovie.save();
    return newMovie;
};

module.exports = {
    getMovies,
    addMovie
};