const Group = require('../models/group');
const usersService = require('../services/usersService');

const populateFields = [
  { path: 'members' },
  { path: 'history' },
]

const getGroups = async (userId, populate=true) => (
  Group.find({ members: userId })
    .populate(populate ? populateFields : [])
);

const getGroup = async (groupId, populate=true) => (
  Group.findById(groupId)
    .populate(populate ? populateFields : [])
);

const createGroup = async (name, creatorId) => {
  const data = {
    name,
    members: [creatorId]
  };
  const newGroup = new Group(data);
  await newGroup.save();
  await usersService.addGroupToUser(creatorId, newGroup._id);
  return newGroup;
};

const updateGroup = async (groupToUpdate) => {
  const groupUpdated = await Group.findByIdAndUpdate(
    groupToUpdate._id,
    groupToUpdate,
    {
      new: true, runValidators: true, context: 'query' 
    }
  );
  return groupUpdated;
};

const addNewActivity = async (groupId, activity) => {
  const groupQuery = await Group.findById(groupId);
  const groupToUpdate = {
    ...groupQuery.toObject(),
    history: groupQuery.history.concat(activity)
  };
  return await updateGroup(groupToUpdate);
};

const addNewMember = async (groupId, newMemberId) => {
  const groupQuery = await Group.findById(groupId);

  const groupToUpdate = {
    ...groupQuery.toObject(),
    members: groupQuery.members.concat(newMemberId)
  };
  
  const groupUpdated = await updateGroup(groupToUpdate);
  await usersService.addGroupToUser(newMemberId, groupUpdated._id)

  return groupUpdated;
};

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  addNewActivity,
  addNewMember
};