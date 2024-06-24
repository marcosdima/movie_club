const Group = require('../models/group');
const activityService = require('./activitiesService');
const usersService = require('../services/usersService');

const populateFields = [
  { path: 'members' },
  { path: 'history' },
];

const getGroups = async (userId, populate=true) => (
  Group.find({ members: userId })
    .populate(populate ? populateFields : [])
);

const getGroup = async (groupId, populate=true) => (
  Group.findById(groupId)
    .populate(populate ? populateFields : [])
);

const createGroup = async (name, creatorId, populate=true) => {
  const data = {
    name,
    members: [creatorId]
  };
  const newGroup = new Group(data);
  await newGroup.save();
  await usersService.addGroupToUser(creatorId, newGroup._id);
  return newGroup.populate(populate ? populateFields : []);
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
  await usersService.addGroupToUser(newMemberId, groupUpdated._id);

  return groupUpdated;
};

const removeAMember = async (groupId, memberToRemove) => {
  const groupQuery = await Group.findById(groupId);

  const groupToUpdate = {
    ...groupQuery.toObject(),
    members: groupQuery.members.filter((member) => member.id == memberToRemove)
  };
  
  const groupUpdated = await updateGroup(groupToUpdate);
  await usersService.removeGroup(memberToRemove, groupUpdated._id);

  // If the group has no members, then delete it.
  if (groupUpdated.members.length === 0) deleteGroup(groupUpdated);

  return groupUpdated;
};

const deleteGroup = async ({ id, history }) => {
  // Deletes group activities.
  history.forEach((activity) => activityService.deleteActivity(activity.toString()));

  // Deletes group.
  await Group.deleteOne({ _id: groupId });
};

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  addNewActivity,
  addNewMember,
  removeAMember
};