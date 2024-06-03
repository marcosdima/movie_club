const groupsService = require('../services/groupsService');
const groupRouter = require('express').Router();

groupRouter.use(async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'token invalid' });
  next();
});

groupRouter.get('/', async (req, res) => {
  const { user } = req;
  const groups = await groupsService.getGroups(user.id);
  res.json(groups);
});

groupRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const group = await groupsService.getGroup(id);
  res.json(group);
});

groupRouter.post('/', async (req, res) => {
  const { groupName } = req.body;
  if (!groupName) return res.status(400).json({ error: "missing groupName field" });

  const { user } = req;
  const group = await groupsService.createGroup(groupName, user.id);
  res.status(201).json(group);
});

groupRouter.post('/leave', async (req, res) => {
  const { user: { id: userId }, group } = req;
  if (!group) return res.status(400).json({ error: "missing groupId" });

  const isAMember = group.members.find(({ id }) => id == userId);
  if (!isAMember) return res.status(403).json({ error: "user does not belong to group" });

  const groupUpdated = await groupsService.removeAMember(group.id, userId);

  res.status(201).json(groupUpdated);
});

module.exports = groupRouter;