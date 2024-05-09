const Activity = require('../models/activity');

const getActivities = async (groupId) => Activity.find({ group: groupId });

const createActivity = async (group, movie) => {
    const newActivity = new Activity({ group, movie });
    await newActivity.save();
    return newActivity;
}

module.exports = {
    getActivities,
    createActivity
};