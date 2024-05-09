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
    const { groupId } = req.body;
    if (!groupId) return (
        res.status(400).json({ 
            error: { 
                message: 'Group Id missing' 
            } 
        })
    );
    const group = await groupsService.getGroup(groupId)

    // Checks if user belongs to the group...
    const belongs = group.members.find((member) => member.id === user.id)
    if (!belongs) return (
        res.status(400).json({ 
            error: { 
                message: `User ${user.username} does not belong to group ${group.name}`
            }
        })
    );

    req.group = group;
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

    const { group } = req;
    const newActivity = activitiesService.createActivity(group.id, movieId);

    // TOTHINK: Maybe this should be handle by group sevice...
    group.history.push(newActivity);
    await group.save();
    res.status(201).json(newActivity);
});

module.exports = activitiesRouter;