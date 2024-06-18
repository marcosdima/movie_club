const Comment = require('../models/comment');
const activitiesService = require('../services/activitiesService');

const populateFields = [
  { path: 'activity' },
  { path: 'writer' },
];

const getComments = async (activityId, populate=true) => (
  await Comment.find({ activity: activityId }).populate(populate ? populateFields : [])
);

const getComment = async (query, populate=true) => (
  await Comment.findOne(query).populate(populate ? populateFields : [])
);

const getCommentById = async (id, populate=true) => await getComment({ _id: id }, populate);

const createComment =  async (comment) => {
  const newComment = new Comment(comment);
  await newComment.save();
  await activitiesService.addComment(newComment.id, newComment.activity);
  return newComment.populate(populateFields);
};

const deleteComment = async (id) => {
  await Comment.deleteOne({ _id: id });
};

module.exports = {
  getComments,
  getComment,
  getCommentById,
  createComment,
  deleteComment
};