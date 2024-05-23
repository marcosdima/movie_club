const activitiesRouter = require('express').Router();
const activitiesService = require('../services/activitiesService')
const groupsService = require('../services/groupsService')

// Middleware to check if the data recieve is correct...
activitiesRouter.use(async (req, res, next) => {
    // Checks if user exists...
    const { user } = req;
    if (!user) return (
        res.status(404).json({
            error: {
                message: 'Token invalid'
            }
        })
    );

    // Checks if the group exists...
    const { groupId } = req.body || req.body.activity.group;
    if (!groupId) return (
        res.status(400).json({ 
            error: { 
                message: 'Group Id missing' 
            } 
        })
    );

    // Checks if user belongs to the group...
    const belongs = req?.group.members.find((member) => member.id === user.id)
    if (!belongs) return (
        res.status(403).json({ 
            error: { 
                message: `User ${user.username} does not belong to group ${group.name}`
            }
        })
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
        res.status(400).json({
            error: {
                message: 'movieId is missing'
            }
        })
    );

    const { group: { id } } = req;
    const newActivity = await activitiesService.createActivity(id, movieId);

    await groupsService.addNewActivity(id, newActivity);
    res.status(201).json(newActivity);
});

activitiesRouter.put('/', async (req, res) => {
    // TODO: Check if watched and comments don't have elements repeated..
    const { activityToUpdate } = req.body;
    const activityUpdated = await activitiesService.updateActivity(activityToUpdate);
    res.status(201).json(activityUpdated);
});

module.exports = activitiesRouter;