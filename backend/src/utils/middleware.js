const jwt = require('jsonwebtoken');
const logger = require('./logger')

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer '))
    request.token = authorization.replace('Bearer ', '');
  next();
};

const userExtractor = (request, response, next) => {
  if (request.token) {
    try {
      request.user = jwt.verify(request.token, process.env.SECRET);
    } catch(error){
      logger.error(`Error: ${error.message}`);
    }
  }
  next();
};

module.exports = {
  tokenExtractor,
  userExtractor
};