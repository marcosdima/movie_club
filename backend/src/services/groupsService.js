const Group = require('../models/group');
const Activity = require('../models/activity');

const getGroups = async (userId) => Group.find({ members: userId }).populate('members');

const createGroup = async (name, creatorId) => {
  const data = {
    name,
    members: [creatorId]
  };
  const newGroup = new Group(data);
  await newGroup.save();
  return newGroup;
};

const getGroup = async (groupId) => (
  Group.findById(groupId)
    .populate('members')
    .populate('history')
);

module.exports = {
  getGroups,
  createGroup,
  getGroup
};