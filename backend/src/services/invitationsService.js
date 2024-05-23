const Invitation = require("../models/invitation");

const getInvitations = async (query, populate=true) => (
    populate
        ?   await Invitation
                .find(query)
                .populate('group')
                .populate('from')
                .populate('to')
        :   await Invitation.findOne(query)
);

const getInvitation = async (query, populate=true) => (
    populate
        ?   await Invitation
                .findOne(query)
                .populate('group')
                .populate('from')
                .populate('to')
        :   await Invitation.findOne(query)
);

const getInvitationById = async (id, populate=true) => getInvitation({ _id: id }, populate);

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