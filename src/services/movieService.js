const movie = require('../models/movie');

const getMovies = async () => await movie.find({});

const addMovie = async (movie) => {
    // TODO 
};

module.exports = {
    getMovies
};