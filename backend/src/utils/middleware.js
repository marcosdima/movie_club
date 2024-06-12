const jwt = require('jsonwebtoken');
const logger = require('./logger');
const groupsService = require('../services/groupsService');
const checkStructure = require('./functions').checkStructure; 

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer '))
    request.token = authorization.replace('Bearer ', '');
  next();
};

const userExtractor = (request, response, next) => {
  if (request.token) request.user = jwt.verify(request.token, process.env.SECRET);
  next();
};

const groupExtractor = async (request, response, next) => {
  const groupId = request.body.groupId;
  if (groupId) request.group = await groupsService.getGroup(groupId);
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  switch(error.name) {
  case ('CastError'): return response.status(400).send({ error: 'malformatted id' }); 
  case ('ValidationError'): return response.status(400).json({ error: error.message });
  case ('JsonWebTokenError'): return response.status(401).json({ error: error.message });
  case ('TokenExpiredError'): return response.status(401).json({ error: 'token expired' });
  case ('MongoServerError'): return response.status(409).json({ error: error.message });
  }

  next(error);
};

const checkModelStructure = (model, omitKeys=[]) => {
  return (req, res, next) => {
    const obj = req.body;
    console.log(model.schema.obj);
    const { missingKeys, extraKeys } = checkStructure(model.schema.obj, obj, omitKeys);
    if (extraKeys.length > 0) return res.status(400).send({ error: `Extra keys founded: ${extraKeys.join(', ')}.`});
    else if (missingKeys.length > 0) return res.status(400).send({ error: `Missing keys: ${missingKeys.join(', ')}.`});
    next();
  };
};

module.exports = {
  tokenExtractor,
  userExtractor,
  groupExtractor,
  unknownEndpoint,
  errorHandler,
  checkModelStructure
};