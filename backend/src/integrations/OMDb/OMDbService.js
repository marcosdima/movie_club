const axios = require('axios');
const baseUrl = `http://www.omdbapi.com/?apikey=${process.env.OMDbKEY}`;

const movieFormatter = ({ Title, Director, Genre, Plot, Poster, imdbID }) => (
  {
    imdbID,
    title: Title,
    director: Director,
    description: Plot,
    genres: Genre?.split(', ') ?? '',
    imageUrl: Poster
  }
);

const getById = async (id) => {
  const data = await axios.get(`${baseUrl}&i=${id}`);
  return movieFormatter(data);
};

const searchByTitle = async (title) => {
  const { data: { Search } } = await axios.get(`${baseUrl}&s=${title}`);
  return Search.map((data) => movieFormatter(data));
};

module.exports = { getById, searchByTitle };