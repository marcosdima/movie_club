const groupsService = require('../services/groupsService');
const groupRouter = require('express').Router();
const Group = require('../models/group');
const checkModelStructure = require('../utils/middleware').checkModelStructure;

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

groupRouter.post('/', checkModelStructure(Group, ['members', 'history']), async (req, res) => {
  const { user } = req;
  const { name: groupName } = req.body;
  const group = await groupsService.createGroup(groupName, user.id);
  res.status(201).json(group);
});

groupRouter.post('/leave/:groupId', async (req, res) => {
  const { user: { id: userId } } = req;
  const { groupId } = req.params; 
  const group = await groupsService.getGroup(groupId);

  if (!group) return res.status(404).json({ error: "group not found" });

  const isAMember = group.members.find(({ id }) => id == userId);
  if (!isAMember) return res.status(403).json({ error: "user does not belong to group" });

  const groupUpdated = await groupsService.removeAMember(groupId, userId);

  res.status(201).json(groupUpdated);
});

module.exports = groupRouter;