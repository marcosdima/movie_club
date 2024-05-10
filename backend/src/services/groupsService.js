const Group = require('../models/group');
const Activity = require('../models/activity');
const group = require('../models/group');

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

const updateGroup = async (groupToUpdate) => {
  const groupUpdated = await Group.findByIdAndUpdate(
    groupToUpdate.id,
    groupToUpdate,
    { new: true, runValidators: true, context: 'query' }
  )

  return groupUpdated;
};

const addNewActivity = async (group, activity) => {
  const groupToUpdate = {
    ...group,
    history: group.history.concat(activity)
  };
  
  return await updateGroup(groupToUpdate);
};

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  addNewActivity
};