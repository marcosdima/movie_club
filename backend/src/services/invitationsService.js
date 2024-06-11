const Invitation = require("../models/invitation");

const populateFields = [
  { 
    path: 'group',
    populate: [
      { path: 'members' },
      { path: 'history' } 
    ]
  },
  { path: 'from' },
  { path: 'to' },
];

const getInvitations = async (query, populate=true) => (
  await Invitation
    .find(query)
    .populate(populate ? populateFields : [])
);

const getInvitation = async (query, populate=true) => (
  await Invitation
    .findOne(query)
    .populate(populate ? populateFields : [])
);

const getInvitationById = async (id, populate=true) => getInvitation({ _id: id }, populate);

const createInvitation = async (invitation) => {
  const newInvitation = new Invitation(invitation);
  return await newInvitation.save();
};

const updateInvitation = async (id, accepted, populate=true) => (
  await Invitation.findByIdAndUpdate(
    id,
    // Accepted it's the only field that can be modified.
    { $set: { accepted } },
    { new: true } // Devolver el documento actualizado
  ).populate(populate ? populateFields : [])
);

module.exports = {
  getInvitations,
  getInvitation,
  getInvitationById,
  createInvitation,
  updateInvitation
};