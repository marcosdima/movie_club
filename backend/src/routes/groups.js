const groupsService = require('../services/groupsService');
const groupRouter = require('express').Router();

groupRouter.get('/', async (req, res) => {
    const { userId } = req.body;
    const groups = await groupsService.getGroups(userId);
    res.json(groups);
});

groupRouter.post('/', async (req, res) => {
    const { userId, groupName } = req.body;
    const groups = await groupsService.createGroup(groupName, userId);
    res.json(groups);
});

module.exports = groupRouter;