const Activity = require('../models/activity');
const commentsService = require('./commentsService'); 

const getActivities = async (groupId) => await Activity.find({ group: groupId });

const getActivity = async (query) => await Activity.findOne(query);

const getActivityById = async (id) => await getActivity({ _id: id });

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
};

const addComment = async (commentId, activityId) => {
  const activity = await getActivityById(activityId);
  const activityToUpdate = {
    ...activity.toObject(),
    comments: activity.comments.concat(commentId)
  };
  return await updateActivity(activityToUpdate);
};

const removeWatcher = async (userId, activityId) => {
  const activity = await getActivityById(activityId);
  const activityToUpdate = {
    ...activity.toObject(),
    watched: activity.watched.filter((id) => id.toString() !== userId)
  };
  return await updateActivity(activityToUpdate);
};

const removeComment = async (commentId, activityId) => {
  const activity = await getActivityById(activityId);
  const activityToUpdate = {
    ...activity.toObject(),
    comments: activity.comments.filter(({ id }) => id === commentId)
  };
  return await updateActivity(activityToUpdate);
};

const deleteActivity = async (activityId) => {
  const { comments } = getActivityById(activityId);
  comments.forEach((comment) => commentsService.deleteComment(comment.toString()));
  await Activity.deleteOne({ _id: activityId });
};

module.exports = {
  getActivities,
  getActivity,
  getActivityById,
  createActivity,
  addWatcher,
  addComment,
  removeComment,
  removeWatcher,
  deleteActivity
};