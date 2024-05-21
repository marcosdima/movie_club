const Invitation = require("../models/invitation");

const getInvitations = async (query) => await Invitation.find(query);

const getInvitation = async (query) => await Invitation.findOne(query);

const createInvitation = async (invitation) => {
    const newInvitation = new Invitation(invitation);
    return await newInvitation.save();
}

module.exports = {
    getInvitations,
    getInvitation,
    createInvitation
};