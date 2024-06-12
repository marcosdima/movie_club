const Comment = require('../models/comment');
const activitiesService = require('../services/activitiesService');

const getComments = async (activityId) => await Comment.find({ activity: activityId });

const getComment = async (query) => await Comment.findOne(query);

const getCommentById = async (id) => await getActivity({ _id: id });

const createComment =  async (comment) => {
  const newComment = new Comment(comment);
  await newComment.save();
  await activitiesService.addComment(newComment.id, newComment.activity);
  return newComment;
};

module.exports = {
  getComments,
  getComment,
  getCommentById,
  createComment
};