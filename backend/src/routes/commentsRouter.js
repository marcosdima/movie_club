const commentsRouter = require('express').Router();
const commentsService = require('../services/commentsService');
const activitiesService = require('../services/activitiesService');
const groupsService = require('../services/groupsService');
const Comment = require('../models/comment');
const checkModelStructure = require('../utils/middleware').checkModelStructure;

// Middleware to valid if a comment can be created.
const validCreation = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'token invalid' });

  const { activity: activityId } = req.body;

  const activity = await activitiesService.getActivityById(activityId);
  if (!activity) return res.status(404).json({ error: 'activity does not exist' });

  const { members } = await groupsService.getGroup(activity.group, false);
  const { id: userId } = req.user;
  const membersIds = members.map((member) => member.toString());
  if (!membersIds.includes(userId)) return res.status(404).json({ error: "user don't belong to the activity group" });

  next();
};

commentsRouter.get('/:activityId', async (req, res) => {
  const { activityId } = req.params;
  res.json(await commentsService.getComments(activityId));
});

commentsRouter.post('/', validCreation, checkModelStructure(Comment), async (req, res) => {
  const newComment = await commentsService.createComment(req.body);
  res.status(201).json(newComment);
});

module.exports = commentsRouter;