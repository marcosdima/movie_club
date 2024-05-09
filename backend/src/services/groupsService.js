const group = require('../models/group');

const getGroups = async (id) => group.find({ members: id }).populate('members');

const createGroup = async (name, creatorId) => {
  const data = {
    name,
    members: [creatorId]
  };
  const newGroup = new group(data);
  await newGroup.save();
  return newGroup;
};

module.exports = {
  getGroups,
  createGroup
};