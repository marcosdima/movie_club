const OMDb = require('./OMDb/OMDbRouter');
const integrationsRouter = require('express').Router();

integrationsRouter.use('/omdb', OMDb);

module.exports = integrationsRouter;