const Invitation = require("../models/invitation");

const getInvitations = async (from, to) => await Invitation.find({ to, from });

const createInvitation = async (invitation) => {
    const newInvitation = new Invitation(invitation);
    return await newInvitation.save();
}

module.exports = {
    getInvitations,
    createInvitation
};