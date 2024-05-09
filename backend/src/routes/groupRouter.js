const groupsService = require('../services/groupsService');
const groupRouter = require('express').Router();

groupRouter.get('/', async (req, res) => {
  const { user } = req;
  if (!user) return res.status(404).json({ error: { message: 'Token invalid' } });
  const groups = await groupsService.getGroups(user.id);
  res.json(groups);
});

groupRouter.post('/', async (req, res) => {
  const { groupName } = req.body;
  const { user } = req;
  if (!user) return res.status(404).json({ error: { message: 'Token invalid' } });
  const group = await groupsService.createGroup(groupName, user.id);
  res.json(group);
});

module.exports = groupRouter;