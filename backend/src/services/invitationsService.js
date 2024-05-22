const Invitation = require("../models/invitation");

const getInvitations = async (query) => (
    await Invitation
        .find(query)
        .populate('group')
        .populate('from')
);

const getInvitation = async (query) => (
    await Invitation
        .findOne(query)
        .populate('group')
        .populate('from')
);

const getInvitationById = async (id) => (
    await Invitation
        .findById(id)
        .populate('group')
        .populate('from')
);

const createInvitation = async (invitation) => {
    const newInvitation = new Invitation(invitation);
    return await newInvitation.save();
};

const updateInvitation = async (id, accepted) => {
    return await Invitation.findByIdAndUpdate(
        id,
        // Accepted it's the only field that can be modified.
        { $set: { accepted } },
        { new: true } // Devolver el documento actualizado
    );
};

module.exports = {
    getInvitations,
    getInvitation,
    getInvitationById,
    createInvitation,
    updateInvitation
};