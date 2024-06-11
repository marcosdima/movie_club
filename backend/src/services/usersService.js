const User = require('../models/user');

// TODO: ask to populate...
const getUser = async (id) => await User.findById(id);

const getUsers = async () => await User.find({});

const addUser = async (data) => {
  const newUser = new User(data);
  await newUser.save();
  return newUser;
};

const updateUser = async (userToUpdate) => {
  const userUpdated = await User.findByIdAndUpdate(
    userToUpdate._id,
    userToUpdate,
    {
      new: true, runValidators: true, context: 'query' 
    }
  );
  return userUpdated;
};

const addGroupToUser = async (userId, groupId) => {
  const user = await getUser(userId);

  const userToUpdate = {
    ...user.toObject(),
    groups: user.groups.concat(groupId)
  };

  return await updateUser(userToUpdate);
};

const removeGroup = async (userId, groupId) => {
  const user = await getUser(userId);

  const userToUpdate = {
    ...user.toObject(),
    groups: user.groups.filter(({ id }) => id == groupId)
  };

  return await updateUser(userToUpdate);
}; 

module.exports = {
  getUser,
  getUsers,
  addUser,
  addGroupToUser,
  removeGroup
};