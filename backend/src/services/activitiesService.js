const Activity = require('../models/activity');

const getActivities = async (groupId) => Activity.find({ group: groupId });

const createActivity = async (group, movie) => {
    const newActivity = new Activity({ group, movie });
    await newActivity.save();
    return newActivity;
};

const updateActivity = async ({ history, watched }) => {
    const activityTarget = await Activity.findById(activityToUpdate.id);

    // The only fields that can be modified are history and watched.
    const update = {
        ...activityTarget,
        history,
        watched,
    };

    const activityUpdated = await Activity.findByIdAndUpdate(
        activityToUpdate.id,
        update,
        { new: true, runValidators: true, context: 'query' }
    );

    return activityUpdated;
};

module.exports = {
    getActivities,
    createActivity,
    updateActivity
};