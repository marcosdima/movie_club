const jwt = require('jsonwebtoken');
const logger = require('./logger')
const groupsService = require('../services/groupsService')

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

const groupExtractor = async (request, response, next) => {
  const groupId = request.body.groupId;
  if (groupId) request.group = await groupsService.getGroup(request.body.groupId);
  next()
}

module.exports = {
  tokenExtractor,
  userExtractor,
  groupExtractor
};