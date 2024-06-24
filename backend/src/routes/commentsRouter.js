const commentsRouter = require('express').Router();
const commentsService = require('../services/commentsService');
const activitiesService = require('../services/activitiesService');
const groupsService = require('../services/groupsService');
const Comment = require('../models/comment');
const checkModelStructure = require('../utils/middleware').checkModelStructure;

// Middleware to valid if a comment can be created.
const activityExists = async (req, res, next) => {
  const { activity: activityId } = req.body;
  const activity = await activitiesService.getActivityById(activityId);

  if (!activity) return res.status(404).json({ error: 'activity does not exist' });
  req.activity = activity;
  next();
};

const belongsToGroup = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'token invalid' });
  const { id } = req.params;
  const { activity } = req;
  let groupId;

  // If req.activity does not exists (Defined at 'activityExists')...
  if (!activity) {
    const comment = await commentsService.getCommentById(id);
    if (!comment) return res.status(404).json({ error: "comment does not exist" }); 
    groupId = comment.activity.group.toString();
  } else groupId = activity.group.toString();

  const { members } = await groupsService.getGroup(groupId, false);
  const { id: userId } = req.user;
  const membersIds = members.map((member) => member.toString());

  if (!membersIds.includes(userId)) return res.status(404).json({ error: "user don't belong to the activity group" });

  next();
};

commentsRouter.get('/:activityId', async (req, res) => {
  const { activityId } = req.params;
  res.json(await commentsService.getComments(activityId));
});

commentsRouter.post('/', checkModelStructure(Comment, omitKeys=['writer']), activityExists, belongsToGroup, async (req, res) => {
  const newComment = await commentsService.createComment({ 
    ...req.body, 
    writer: req.user.id 
  });
  await activitiesService.addComment(newComment.id, newComment.activity);
  res.status(201).json(newComment);
});

commentsRouter.delete('/:id', belongsToGroup, async (req, res) => {
  const { id } = req.params;
  const { activity, writer } = await commentsService.getCommentById(id, false);

  if (writer.toString() !== req.user.id) return res.status(401).json({ error: 'this comment is not yours!' }); 

  await commentsService.deleteComment(id);
  await activitiesService.removeComment(id, activity);
  res.json({ message: 'Comment deleted successfully!' });
});

module.exports = commentsRouter;