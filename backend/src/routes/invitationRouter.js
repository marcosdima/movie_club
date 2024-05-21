const invitationsService = require('../services/invitationsService');
const invitationRouter = require('express').Router();

invitationRouter.use(async (req, res, next) => {
    if (!req.user) return (
        res.status(401).json({ 
            error: { 
                message: 'Login required or invalid token...' 
            } 
        })
    );
    next();
})

invitationRouter.get('/', async (req, res) => {
    const invitations = await invitationsService.getInvitations({ to: req.user.id });
    return res.json(invitations);
});

invitationRouter.get('/:from/to/:to', async (req, res) => {
    const { from, to } = req.body;

    // Checks if the parameters are right...
    if (!to || !from) return res.status(400).json({
        error: {
            message: "Missing fields 'from' and/or 'to'"
        }
    });
    const newInvitation = await invitationsService.getInvitations({ from, to });

    // Checks if exist any invitation to this user...
    if (!newInvitation) return res.status(404).json({
        error: {
            message: `Does't exist any invitation to ${user.username}`
        }
    });
    return res.json(newInvitation);
});

invitationRouter.post('/', async (req, res) => {
    const { id: from } = req.user;
    const { to, groupId } = req.body;

    if (!to || !groupId) return res.status(400).json({
        error: {
            message: "Missing fields 'to' and/or 'groupId'"
        }
    });

    // Check if already exists an invitation...
    const alreadyExists = await invitationsService.getInvitation({ to, from, group: groupId });
    if (alreadyExists) return res.status(409).json({
        error: {
            message: "There is already an invitation for this user to this group..."
        }
    });

    const data = await invitationsService.createInvitation({ from, to, group: groupId });

    return res.status(201).json(data);
});


module.exports = invitationRouter;