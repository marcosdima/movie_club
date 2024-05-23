const user = require('../models/user');

// TODO: ask to populate...
const getUser = async (id) => await user.findById(id);

const getUsers = async () => await user.find({});

const addUser = async (data) => {
  const newUser = new user(data);
  await newUser.save();
  return newUser;
};

module.exports = {
  getUser,
  getUsers,
  addUser
};