const commentsRouter = require('express').Router();
const commentsService = require('../services/commentsService');
const activitiesService = require('../services/activitiesService');
const groupsService = require('../services/groupsService');

commentsRouter.get('/:activityId', async (req, res) => {
  const { activityId } = req.params;
  res.json(await commentsService.getComments(activityId));
});

commentsRouter.use(async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'token invalid' });

  const { activity: activityId } = req.body;

  const activity = await activitiesService.getActivityById(activityId);
  if (!activity) return res.status(404).json({ error: 'activity does not exist' });

  const { members } = await groupsService.getGroup(activity.group, false);
  const { id: userId } = req.user;
  const membersIds = members.map((member) => member.toString());
  if (!membersIds.includes(userId)) return res.status(404).json({ error: "user don't belong to the activity group" });

  next();
});

commentsRouter.post('/', async (req, res) => {
  // TODO: Check if req.body has the right fields.
  const newComment = await commentsService.createComment(req.body);
  res.status(201).json(newComment);
});

module.exports = commentsRouter;