const groupsService = require('../services/groupsService');
const groupRouter = require('express').Router();

groupRouter.get('/', async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).json({ error:  'token invalid' });
  const groups = await groupsService.getGroups(user.id);
  res.json(groups);
});

groupRouter.get('/:id', async (req, res) => {
  const { user } = req;
  if (!user) return res.status(401).json({ error: 'token invalid' });

  const { id } = req.params;
  const group = await groupsService.getGroup(id);
  res.json(group);
});

groupRouter.post('/', async (req, res) => {
  const { groupName } = req.body;
  const { user } = req;
  if (!user) return res.status(401).json({ error: 'token invalid' });
  const group = await groupsService.createGroup(groupName, user.id);
  res.json(group);
});

module.exports = groupRouter;