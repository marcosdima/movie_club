const Group = require('../models/group');

const getGroups = async (userId) => (
  Group.find({ members: userId })
    .populate('members')
    .populate('history')
);

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

  return await updateGroup(groupToUpdate);
};

module.exports = {
  getGroups,
  createGroup,
  getGroup,
  addNewActivity,
  addNewMember
};