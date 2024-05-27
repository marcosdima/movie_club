const activitiesRouter = require('express').Router();
const activitiesService = require('../services/activitiesService');
const groupsService = require('../services/groupsService');

// Middleware to check if the data recieve is correct...
activitiesRouter.use(async (req, res, next) => {
  // Checks if user exists...
  const { user } = req;

  if (!user) return (
    res.status(404).json({error: 'login required'})
  );

  // Checks if the group exists...
  const { groupId } = req.body || req.body.activity.group;
  if (!groupId) return (
    res.status(400).json({error: 'Group Id missing'})
  );

  // Checks if user belongs to the group...
  const belongs = req?.group.members.find((member) => member.id === user.id);
  if (!belongs) return (
    res.status(403).json({error: `User ${user.username} does not belong to group ${group.name}`})
  );

  next();
});

activitiesRouter.get('/', async (req, res) => {
  const { group } = req;
  res.json(await activitiesService.getActivities(group.id));
});

activitiesRouter.post('/', async (req, res) => {
  const { movieId } = req.body;
  if (!movieId) return (
    res.status(400).json({error: 'movieId is missing'})
  );

  const { group: { id } } = req;
  const newActivity = await activitiesService.createActivity(id, movieId);

  await groupsService.addNewActivity(id, newActivity);
  res.status(201).json(newActivity);
});

activitiesRouter.put('/:id/watched', async (req, res) => {
  // TODO: Check if comments don't have elements repeated..
  const { id } = req.params;
  
  // If the activity does not exists...
  const activityTarget = await activitiesService.getActivityById(id);
  if (!activityTarget) return (
    res.status(404).json({error: 'activity does not exists'})
  )

  // If the activity isn't present in the group...
  const historyIncludes = req.group.history.find(({ _id }) => _id.toString() === id);
  if (!historyIncludes) return (
    res.status(403).json({error: 'activity does not exists in group'})
  )

  // If the activity already was marked as watched...
  const userId = req.user.id;
  const alreadyWatched = activityTarget.watched.find(({ _id }) => _id.toString() === userId);
  if (alreadyWatched) return (
    res.status(403).json({error: 'user already watched'})
  )
  
  const activityUpdated = await activitiesService.addWatcher(userId, id);
  res.status(200).json(activityUpdated);
});

module.exports = activitiesRouter;