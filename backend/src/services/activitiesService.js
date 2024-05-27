const Activity = require('../models/activity');

const getActivities = async (groupId) => await Activity.find({ group: groupId });

const getActivity = async (query) => await Activity.findOne(query);

const getActivityById = async (id) => await getActivity({ _id: id })

const createActivity = async (group, movie) => {
  const newActivity = new Activity({ group, movie });
  await newActivity.save();
  return newActivity;
};

const updateActivity = async (activityToUpdate) => {
  const activityUpdated = await Activity.findByIdAndUpdate(
    activityToUpdate._id,
    activityToUpdate,
    {
      new: true, runValidators: true, context: 'query' 
    }
  );
  return activityUpdated;
};

const addWatcher = async (userId, activityId) => {
  const activity = await getActivityById(activityId);
  const activityToUpdate = {
    ...activity.toObject(),
    watched: activity.watched.concat(userId)
  };
  return await updateActivity(activityToUpdate);
}

module.exports = {
  getActivities,
  getActivity,
  getActivityById,
  createActivity,
  addWatcher
};