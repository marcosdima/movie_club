const movie = require('../models/movie');

const getMovies = async () => await movie.find({});

const addMovie = async (data) => {
    const newMovie = new movie(data);
    await newMovie.save();
    return newMovie;
};

const addMovies = async (data) => {
    const newMovies = await movie.insertMany(data);
    return newMovies;
};

module.exports = {
    getMovies,
    addMovie,
    addMovies
};