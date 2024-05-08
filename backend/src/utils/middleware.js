const jwt = require('jsonwebtoken');

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

module.exports = {
    tokenExtractor,
	userExtractor
};