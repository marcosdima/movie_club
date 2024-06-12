const invitationsService = require('../services/invitationsService');
const groupsService = require('../services/groupsService');
const invitationRouter = require('express').Router();

invitationRouter.use(async (req, res, next) => {
  if (!req.user) return (
    res.status(401).json({error: 'Login required or invalid token...'})
  );
  next();
});

invitationRouter.get('/', async (req, res) => {
  const invitations = await invitationsService.getInvitations({ to: req.user.id, accepted: null });
  return res.json(invitations);
});

invitationRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  const invitation = await invitationsService.getInvitationById(id);
  return res.json(invitation);
});

invitationRouter.get('/:from/to/:to', async (req, res) => {
  const { from, to } = req.body;

  // Checks if the parameters are right...
  if (!to || !from) return res.status(400).json({error: "Missing fields 'from' and/or 'to'"});
  const newInvitation = await invitationsService.getInvitations({ from, to });

  // Checks if exist any invitation to this user...
  if (!newInvitation) return res.status(404).json({error: `Does't exist any invitation to ${user.username}`});
  return res.json(newInvitation);
});

invitationRouter.post('/', async (req, res) => {
  const { id: from } = req.user;
  const { to, groupId } = req.body;

  if (!to || !groupId) return res.status(400).json({error: "Missing fields 'to' and/or 'groupId'"});

  // Checks if the group with the groupId exists...
  const { members } = req.group;
  if (!members) return res.status(403).json({error: 'groupId does not correspond to an existent group'});

  // Checks if the creator is member of the group...
  const creatorBelongsToGroup = members.find(({ id }) => id === from);
  if (!creatorBelongsToGroup) return res.status(403).json({error: 'you are not a member of the group, so you can not create an invitation'});

  // Checks if the invitation was sended to a group member
  const targetBelongsToGroup = members.find(({ id }) => id === to);
  if (targetBelongsToGroup) return res.status(403).json({error: 'user already belongs to the group'});

  // Checks if already exists an invitation...
  const alreadyExists = await invitationsService.getInvitation({
    to, group: groupId, accepted: null 
  });
  if (alreadyExists) return res.status(409).json({error: "There is already an invitation for this user to this group..."});

  const data = await invitationsService.createInvitation({
    from, to, group: groupId 
  });

  return res.status(201).json(data);
});

invitationRouter.put('/:id', async (req, res) => {
  const { accepted } = req.body;
  if (!accepted) return res.status(400).json({ error: 'missing field accepted' });

  const { id } = req.params;
  const invitation = await invitationsService.getInvitationById(id, populate=false);

  // Checks if invitation exists...
  if (!invitation) return res.status(404).json({ error: 'Invitation does not exist' });
    
  // Checks if invitation was updated before...
  if (invitation.accepted) return res.status(403).json({ error: 'Invitation was already responded' });

  // Checks if the user is the owner of the invitation...
  const { user: { id: userId, username } } = req;
  if (invitation.to.toString() !== userId) return res.status(403).json({ error: `Invitation does not belongs to '${username}'` });

  // If the user accepted the invitation...
  if (accepted) await groupsService.addNewMember(invitation.group.toString(), invitation.to.toString());
  const data = await invitationsService.updateInvitation(id, accepted);

  return res.json(data);
});


module.exports = invitationRouter;