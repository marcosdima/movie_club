const OMDbRouter = require('express').Router();
const OMDbService = require('./OMDbService');

OMDbRouter.get('/search/:title', async (req, res) => {
  const data = await OMDbService.searchByTitle(req.params.title);
  res.json(data);
});

OMDbRouter.get('/:OMDbId', async (req, res) => {
  const movieData = await OMDbService.getById(req.params.OMDbId);
  res.json(movieData);
});

module.exports = OMDbRouter;