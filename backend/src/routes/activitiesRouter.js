const activitiesRouter = require('express').Router();
const activitiesService = require('../services/activitiesService');
const groupsService = require('../services/groupsService');

const validateActivity = async (req, res, next) => {
  const { id } = req.params;

  // If the activity does not exists...
  const activityTarget = await activitiesService.getActivityById(id);
  if (!activityTarget) {
    return res.status(404).json({ error: 'activity does not exist' });
  }
  
  // If the activity isn't present in the group...
  const historyIncludes = req.group.history.find(({ _id }) => _id.toString() === id);
  if (!historyIncludes) {
    return res.status(403).json({ error: 'activity does not exist in group' });
  }

  req.activityTarget = activityTarget;
  next();
};

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

activitiesRouter.put('/:id/watched', validateActivity, async (req, res) => {
  const { id } = req.params;
  const { activityTarget, user: { id: userId } } = req;

  // If the activity already was marked as watched...
  const alreadyWatched = activityTarget.watched.find(({ _id }) => _id.toString() === userId);
  if (alreadyWatched) return (
    res.status(403).json({error: 'user already watched'})
  );
  
  const activityUpdated = await activitiesService.addWatcher(userId, id);
  res.status(200).json(activityUpdated);
});

activitiesRouter.put('/:id/unwatched', validateActivity, async (req, res) => {
  const { id } = req.params;
  const { activityTarget, user: { id: userId } } = req;

  // If the activity wasn't marked as watched...
  const userWatched = activityTarget.watched.find(({ _id }) => _id.toString() === userId);
  if (!userWatched) return (
    res.status(403).json({error: 'user was not marked it as watched'})
  );
  
  const activityUpdated = await activitiesService.removeWatcher(userId, id);
  res.status(200).json(activityUpdated);
});

module.exports = activitiesRouter;