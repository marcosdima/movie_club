const mongoose = require('mongoose');

const commentScheme = mongoose.Schema({
    content: String,
    writter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    }
});

commentScheme.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
	}
});

module.exports = mongoose.model('Comment', commentScheme);